const express = require("express");
const { getEventDetail, getEvents } = require("../services/event-service");

const router = express.Router();

router.get("/", (request, response) => {
  const events = getEvents(request.query);

  response.json({
    month: request.query.month || null,
    count: events.length,
    events
  });
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
