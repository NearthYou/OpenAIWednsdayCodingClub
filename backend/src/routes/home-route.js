const express = require("express");
const { requireSessionUser } = require("../services/auth-service");
const { getDashboard, searchDiscovery } = require("../services/home-service");

const router = express.Router();

function getSessionToken(request) {
  return request.get("x-session-token") || "";
}

function sendError(response, error) {
  response.status(error.statusCode || 500).json({
    message: error.message || "Unexpected server error."
  });
}

router.get("/dashboard", (request, response) => {
  try {
    const session = requireSessionUser(getSessionToken(request));
    response.json({
      dashboard: getDashboard(session.user)
    });
  } catch (error) {
    sendError(response, error);
  }
});

router.get("/search", (request, response) => {
  try {
    const session = requireSessionUser(getSessionToken(request));
    response.json(searchDiscovery(session.user, request.query.q || ""));
  } catch (error) {
    sendError(response, error);
  }
});

module.exports = router;
