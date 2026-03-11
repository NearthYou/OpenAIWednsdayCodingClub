const { getAllEvents, getEventById } = require("../repositories/event-repository");
const {
  isSameMonth,
  matchesAnyKeyword,
  matchesSearch,
  parseMultiValue
} = require("../utils/event-filters");

function dedupeEvents(events) {
  const seen = new Set();

  return events.filter((event) => {
    const fingerprint = [
      event.title,
      event.entityName,
      event.startAt,
      event.sourceUrl
    ].join("|");

    if (seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);
    return true;
  });
}

function getEvents(filters = {}) {
  const categories = parseMultiValue(filters.category);
  const sourceTypes = parseMultiValue(filters.sourceType);
  const keywords = parseMultiValue(filters.keyword);

  return dedupeEvents(getAllEvents())
    .filter((event) => !filters.month || isSameMonth(event.startAt, filters.month))
    .filter((event) => !categories.length || categories.includes(event.category))
    .filter((event) => !sourceTypes.length || sourceTypes.includes(event.sourceType))
    .filter((event) => matchesAnyKeyword(event, keywords))
    .filter((event) => matchesSearch(event, filters.search))
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
}

function getEventDetail(id) {
  const event = getEventById(id);

  if (!event) {
    return null;
  }

  const [dedupedEvent] = dedupeEvents([event]);
  return dedupedEvent || null;
}

module.exports = {
  getEventDetail,
  getEvents
};
