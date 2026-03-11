const express = require("express");
const { getEventDetail, getEvents } = require("../services/event-service");
const {
  getOpenAiErrorPayload,
  generateEventSummary
} = require("../services/event-summary-service");

const router = express.Router();

router.get("/", (request, response) => {
  const events = getEvents(request.query);

  response.json({
    month: request.query.month || null,
    count: events.length,
    events
  });
});

router.get("/:id/summary", async (request, response) => {
  const event = getEventDetail(request.params.id);

  if (!event) {
    response.status(404).json({
      message: "Event not found"
    });
    return;
  }

  try {
    const payload = await generateEventSummary(event);
    response.json(payload);
  } catch (error) {
    console.error("Failed to generate event AI summary", error);
    const errorPayload = getOpenAiErrorPayload(error);

    response.status(errorPayload.status).json({
      code: errorPayload.code,
      message: errorPayload.message
    });
  }
});

router.get("/:id", (request, response) => {
  const event = getEventDetail(request.params.id);

  if (!event) {
    response.status(404).json({
      message: "Event not found"
    });
    return;
  }

  response.json({ event });
});

module.exports = router;
