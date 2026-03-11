const { discoveryItems, trendingKeywords } = require("../data/mock-home-content");
const { interestKeywords } = require("../data/interest-keywords");
const { getEvents } = require("./event-service");

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = startOfDay(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function differenceInCalendarDays(targetDate, baseDate) {
  const target = startOfDay(targetDate);
  const base = startOfDay(baseDate);
  return Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getSubscribedKeywords(user) {
  const subscriptionKeywordIds = new Set(user.subscriptionKeywordIds || []);
  return interestKeywords.filter((keyword) => subscriptionKeywordIds.has(keyword.id));
}

function buildKeywordLookup() {
  return new Map(interestKeywords.map((keyword) => [keyword.id, keyword]));
}

function buildScheduleCard(event) {
  return {
    id: event.id,
    title: event.title,
    entityName: event.entityName,
    startAt: event.startAt,
    endAt: event.endAt || null,
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl,
    sourceType: event.sourceType,
    tags: [...(event.tags || [])]
  };
}

function buildDDayCard(event, today) {
  const daysRemaining = differenceInCalendarDays(event.startAt, today);

  return {
    id: event.id,
    title: event.title,
    entityName: event.entityName,
    startAt: event.startAt,
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl,
    daysRemaining,
    ddayLabel: daysRemaining <= 0 ? "D-Day" : `D-${daysRemaining}`
  };
}

function buildClosingSoonCard(item) {
  return {
    id: item.id,
    title: item.title,
    keywordLabel: item.keywordLabel,
    summary: item.summary,
    closingAt: item.closingAt,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl
  };
}

function buildSearchResultFromEvent(event) {
  return {
    id: `event-result-${event.id}`,
    kind: "schedule",
    title: event.title,
    summary: `${event.entityName} 일정입니다. ${event.sourceName} 기준으로 확인하세요.`,
    keywordLabel: event.entityName,
    referenceAt: event.startAt,
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl
  };
}

function buildSearchResultFromDiscoveryItem(item) {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    keywordLabel: item.keywordLabel,
    referenceAt: item.closingAt || item.occursAt || item.publishedAt || null,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl
  };
}

function buildSearchableText(item) {
  return normalizeText(
    [
      item.title,
      item.summary,
      item.keywordLabel,
      item.sourceName
    ].join(" ")
  );
}

function getDashboard(user) {
  const subscribedKeywords = getSubscribedKeywords(user);
  const keywordLabels = subscribedKeywords.map((keyword) => keyword.label);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thisWeekEnd = endOfDay(addDays(now, 6));

  const relevantEvents = getEvents({
    keyword: keywordLabels.join(",")
  });

  const upcomingEvents = relevantEvents
    .filter((event) => new Date(event.startAt).getTime() >= todayStart.getTime())
    .sort((left, right) => left.startAt.localeCompare(right.startAt));

  const todaySchedules = relevantEvents
    .filter((event) => {
      const eventDate = new Date(event.startAt).getTime();
      return eventDate >= todayStart.getTime() && eventDate <= todayEnd.getTime();
    })
    .map(buildScheduleCard);

  const weekSchedules = relevantEvents
    .filter((event) => {
      const eventDate = new Date(event.startAt).getTime();
      return eventDate >= now.getTime() && eventDate <= thisWeekEnd.getTime();
    })
    .map(buildScheduleCard);

  const dDayItems = upcomingEvents.slice(0, 4).map((event) => buildDDayCard(event, now));

  const subscriptionKeywordIds = new Set(subscribedKeywords.map((keyword) => keyword.id));
  const closingSoonItems = discoveryItems
    .filter((item) => item.kind === "deadline")
    .filter((item) => subscriptionKeywordIds.has(item.keywordId))
    .filter((item) => item.closingAt)
    .filter((item) => {
      const closingTime = new Date(item.closingAt).getTime();
      return closingTime >= now.getTime() && closingTime <= endOfDay(addDays(now, 14)).getTime();
    })
    .sort((left, right) => left.closingAt.localeCompare(right.closingAt))
    .slice(0, 4)
    .map(buildClosingSoonCard);

  const nextHighlight = upcomingEvents[0]
    ? `${upcomingEvents[0].entityName} · ${upcomingEvents[0].title}`
    : null;

  return {
    userName: user.displayName,
    subscribedKeywords: subscribedKeywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.label,
      group: keyword.group
    })),
    nextHighlight,
    todaySchedules,
    weekSchedules,
    dDayItems,
    closingSoonItems,
    trendingKeywords: trendingKeywords.map((keyword) => ({
      ...keyword,
      isSubscribed: subscriptionKeywordIds.has(keyword.keywordId)
    }))
  };
}

function searchDiscovery(user, query) {
  const normalizedQuery = normalizeText(query);
  const subscribedKeywords = getSubscribedKeywords(user);
  const subscriptionKeywordIds = new Set(subscribedKeywords.map((keyword) => keyword.id));
  const keywordLookup = buildKeywordLookup();

  const eventResults = getEvents({
    search: normalizedQuery,
    keyword: subscribedKeywords.map((keyword) => keyword.label).join(",")
  })
    .slice(0, 4)
    .map(buildSearchResultFromEvent);

  const discoveryResults = discoveryItems
    .filter((item) => subscriptionKeywordIds.has(item.keywordId))
    .filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return buildSearchableText(item).includes(normalizedQuery);
    })
    .slice(0, 6)
    .map(buildSearchResultFromDiscoveryItem);

  const mergedResults = [...eventResults, ...discoveryResults]
    .sort((left, right) => String(right.referenceAt || "").localeCompare(String(left.referenceAt || "")))
    .slice(0, 8);

  const relatedKeywords = trendingKeywords
    .filter((keyword) => {
      if (!normalizedQuery) {
        return subscriptionKeywordIds.has(keyword.keywordId);
      }

      const keywordMeta = keywordLookup.get(keyword.keywordId);
      return normalizeText(`${keyword.label} ${keywordMeta ? keywordMeta.group : ""}`).includes(normalizedQuery);
    })
    .slice(0, 4)
    .map((keyword) => ({
      ...keyword,
      isSubscribed: subscriptionKeywordIds.has(keyword.keywordId)
    }));

  return {
    query: String(query || "").trim(),
    results: mergedResults,
    relatedKeywords
  };
}

module.exports = {
  getDashboard,
  searchDiscovery
};
