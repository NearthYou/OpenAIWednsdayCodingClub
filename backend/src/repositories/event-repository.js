const { mockEvents } = require("../data/mock-events");

function getAllEvents() {
  return mockEvents.map((event) => ({ ...event }));
}

function getEventById(id) {
  return mockEvents.find((event) => event.id === id) || null;
}

module.exports = {
  getAllEvents,
  getEventById
};
