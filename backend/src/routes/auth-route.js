const express = require("express");
const { getSessionUser, login, logout, signup } = require("../services/auth-service");

const router = express.Router();

function getSessionToken(request) {
  return request.get("x-session-token") || "";
}

function sendError(response, error) {
  response.status(error.statusCode || 500).json({
    message: error.message || "서버 오류가 발생했습니다."
  });
}

router.post("/signup", (request, response) => {
  try {
    const session = signup(request.body);
    response.status(201).json(session);
  } catch (error) {
    sendError(response, error);
  }
});

router.post("/login", (request, response) => {
  try {
    const session = login(request.body);
    response.json(session);
  } catch (error) {
    sendError(response, error);
  }
});

router.get("/session", (request, response) => {
  const session = getSessionUser(getSessionToken(request));

  if (!session) {
    response.status(401).json({
      message: "로그인이 필요합니다."
    });
    return;
  }

  response.json(session);
});

router.post("/logout", (request, response) => {
  logout(getSessionToken(request));
  response.status(204).end();
});

module.exports = router;
