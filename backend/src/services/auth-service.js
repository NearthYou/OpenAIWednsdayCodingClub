const { interestKeywords } = require("../data/interest-keywords");
const {
  completeUserOnboarding,
  createSession,
  createUser,
  deleteSession,
  findSession,
  findUserByEmail,
  findUserById,
  getDefaultSubscriptionKeywordIds,
  updateUserSubscriptionKeywordIds,
  verifyUserPassword
} = require("../repositories/auth-repository");
const { normalizeSeedKeywordIds, recommendKeywords } = require("./keyword-recommendation-service");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeSubscriptionKeywordIds(subscriptionKeywordIds, options = {}) {
  const fallbackToDefault = options.fallbackToDefault ?? true;
  const validKeywordIds = new Set(interestKeywords.map((keyword) => keyword.id));

  const normalizedIds = Array.isArray(subscriptionKeywordIds)
    ? subscriptionKeywordIds
        .map((keywordId) => String(keywordId).trim())
        .filter((keywordId) => validKeywordIds.has(keywordId))
    : [];

  if (normalizedIds.length) {
    return [...new Set(normalizedIds)];
  }

  return fallbackToDefault ? getDefaultSubscriptionKeywordIds() : [];
}

function sanitizeUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    preferenceKeywordIds: [...(user.preferenceKeywordIds || [])],
    subscriptionKeywordIds: [...user.subscriptionKeywordIds],
    hasCompletedOnboarding: Boolean(user.hasCompletedOnboarding),
    onboardingCompletedAt: user.onboardingCompletedAt || null,
    createdAt: user.createdAt
  };
}

function buildSessionPayload(session, user) {
  return {
    sessionToken: session.token,
    user: sanitizeUser(user)
  };
}

function signup(input = {}) {
  const displayName = String(input.displayName || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const subscriptionKeywordIds = sanitizeSubscriptionKeywordIds(input.subscriptionKeywordIds, {
    fallbackToDefault: false
  });

  if (displayName.length < 2) {
    throw createHttpError(400, "닉네임은 2자 이상이어야 합니다.");
  }

  if (!email.includes("@")) {
    throw createHttpError(400, "올바른 이메일 주소를 입력해 주세요.");
  }

  if (password.length < 6) {
    throw createHttpError(400, "비밀번호는 6자 이상이어야 합니다.");
  }

  if (findUserByEmail(email)) {
    throw createHttpError(409, "이미 가입된 이메일입니다.");
  }

  const user = createUser({
    displayName,
    email,
    password,
    subscriptionKeywordIds
  });
  const session = createSession(user.id);

  return buildSessionPayload(session, user);
}

function login(input = {}) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const user = findUserByEmail(email);

  if (!user || !verifyUserPassword(user, password)) {
    throw createHttpError(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const session = createSession(user.id);
  return buildSessionPayload(session, user);
}

function getSessionUser(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const session = findSession(sessionToken);
  if (!session) {
    return null;
  }

  const user = findUserById(session.userId);
  if (!user) {
    return null;
  }

  return buildSessionPayload(session, user);
}

function requireSessionUser(sessionToken) {
  const sessionPayload = getSessionUser(sessionToken);

  if (!sessionPayload) {
    throw createHttpError(401, "로그인이 필요합니다.");
  }

  return sessionPayload;
}

function updateSubscriptionKeywords(sessionToken, input = {}) {
  const currentSession = findSession(sessionToken);

  if (!currentSession) {
    throw createHttpError(401, "로그인이 필요합니다.");
  }

  const nextSubscriptionKeywordIds = sanitizeSubscriptionKeywordIds(input.subscriptionKeywordIds, {
    fallbackToDefault: false
  });
  const user = updateUserSubscriptionKeywordIds(currentSession.userId, nextSubscriptionKeywordIds);

  if (!user) {
    throw createHttpError(404, "사용자 정보를 찾을 수 없습니다.");
  }

  return buildSessionPayload(currentSession, user);
}

function completeOnboarding(sessionToken, input = {}) {
  const currentSession = findSession(sessionToken);

  if (!currentSession) {
    throw createHttpError(401, "로그인이 필요합니다.");
  }

  const seedKeywordIds = normalizeSeedKeywordIds(input.seedKeywordIds || input.subscriptionKeywordIds);

  if (seedKeywordIds.length < 3) {
    throw createHttpError(400, "관심 키워드는 3개 이상 선택해 주세요.");
  }

  const recommendationResult = recommendKeywords(seedKeywordIds, {
    limit: 6
  });
  const user = completeUserOnboarding(currentSession.userId, {
    preferenceKeywordIds: seedKeywordIds,
    subscriptionKeywordIds: recommendationResult.recommendedKeywordIds
  });

  if (!user) {
    throw createHttpError(404, "사용자 정보를 찾을 수 없습니다.");
  }

  return buildSessionPayload(currentSession, user);
}

function logout(sessionToken) {
  if (!sessionToken) {
    return false;
  }

  return deleteSession(sessionToken);
}

module.exports = {
  createHttpError,
  getSessionUser,
  login,
  logout,
  requireSessionUser,
  completeOnboarding,
  signup,
  updateSubscriptionKeywords
};
