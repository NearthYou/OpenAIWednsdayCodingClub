const { createHash, randomUUID } = require("crypto");
const { interestKeywords } = require("../data/interest-keywords");

function hashPassword(password) {
  return createHash("sha256").update(String(password)).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

const defaultSubscriptionKeywordIds = interestKeywords.slice(0, 2).map((keyword) => keyword.id);

const users = [
  {
    id: "user-demo-fan",
    displayName: "Demo Fan",
    email: "demo@ducking.club",
    passwordHash: hashPassword("demo1234"),
    subscriptionKeywordIds: defaultSubscriptionKeywordIds,
    createdAt: new Date().toISOString()
  }
];

const sessions = [];

function getDefaultSubscriptionKeywordIds() {
  return [...defaultSubscriptionKeywordIds];
}

function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => user.email === normalizedEmail) || null;
}

function findUserById(userId) {
  return users.find((user) => user.id === userId) || null;
}

function createUser({ displayName, email, password, subscriptionKeywordIds }) {
  const user = {
    id: randomUUID(),
    displayName: String(displayName).trim(),
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    subscriptionKeywordIds: [...subscriptionKeywordIds],
    createdAt: new Date().toISOString()
  };

  users.push(user);
  return { ...user };
}

function verifyUserPassword(user, password) {
  return user.passwordHash === hashPassword(password);
}

function createSession(userId) {
  const session = {
    token: randomUUID(),
    userId,
    createdAt: new Date().toISOString()
  };

  sessions.push(session);
  return { ...session };
}

function findSession(token) {
  return sessions.find((session) => session.token === token) || null;
}

function deleteSession(token) {
  const index = sessions.findIndex((session) => session.token === token);

  if (index === -1) {
    return false;
  }

  sessions.splice(index, 1);
  return true;
}

module.exports = {
  createSession,
  createUser,
  deleteSession,
  findSession,
  findUserByEmail,
  findUserById,
  getDefaultSubscriptionKeywordIds,
  hashPassword,
  normalizeEmail,
  verifyUserPassword
};
