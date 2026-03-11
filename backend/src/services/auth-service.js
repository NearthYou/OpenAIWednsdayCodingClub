const { interestKeywords } = require("../data/interest-keywords");
const {
  createSession,
  createUser,
  deleteSession,
  findSession,
  findUserByEmail,
  findUserById,
  getDefaultSubscriptionKeywordIds,
  verifyUserPassword
} = require("../repositories/auth-repository");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeSubscriptionKeywordIds(subscriptionKeywordIds) {
  const validKeywordIds = new Set(interestKeywords.map((keyword) => keyword.id));

  const normalizedIds = Array.isArray(subscriptionKeywordIds)
    ? subscriptionKeywordIds
        .map((keywordId) => String(keywordId).trim())
        .filter((keywordId) => validKeywordIds.has(keywordId))
    : [];

  if (normalizedIds.length) {
    return [...new Set(normalizedIds)];
  }

  return getDefaultSubscriptionKeywordIds();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    subscriptionKeywordIds: [...user.subscriptionKeywordIds],
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
  const subscriptionKeywordIds = sanitizeSubscriptionKeywordIds(input.subscriptionKeywordIds);

  if (displayName.length < 2) {
    throw createHttpError(400, "Display name must be at least 2 characters.");
  }

  if (!email.includes("@")) {
    throw createHttpError(400, "A valid email is required.");
  }

  if (password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters.");
  }

  if (findUserByEmail(email)) {
    throw createHttpError(409, "This email is already registered.");
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
    throw createHttpError(401, "Email or password is incorrect.");
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
    throw createHttpError(401, "Authentication is required.");
  }

  return sessionPayload;
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
  signup
};
