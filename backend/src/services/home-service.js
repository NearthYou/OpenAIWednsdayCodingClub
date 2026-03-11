const { discoveryItems, trendingKeywords } = require("../data/mock-home-content");
const { interestKeywords } = require("../data/interest-keywords");
const { getEvents } = require("./event-service");
const { fetchLatestWebArticles } = require("./home-web-search-service");

const CALENDAR_DEADLINE_TOKENS = ["예약", "예매", "티켓", "응모", "신청", "굿즈", "한정판", "판매"];

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

function getCalendarDeadlineAt(event) {
  return event.endAt || event.startAt || null;
}

function isCalendarDeadlineEvent(event) {
  const normalizedTitle = normalizeText(event.title);
  const normalizedTags = normalizeText((event.tags || []).join(" "));

  return (
    event.category === "goods_release" ||
    CALENDAR_DEADLINE_TOKENS.some((token) => {
      const normalizedToken = normalizeText(token);
      return normalizedTitle.includes(normalizedToken) || normalizedTags.includes(normalizedToken);
    })
  );
}

function buildClosingSoonSummary(event) {
  if (event.category === "goods_release") {
    return `${event.entityName} 관련 굿즈 일정의 마감 시각입니다. 상세 캘린더에 등록된 항목만 모아 보여줍니다.`;
  }

  if ((event.tags || []).some((tag) => normalizeText(tag).includes("예매") || normalizeText(tag).includes("티켓"))) {
    return `${event.entityName} 관련 예매 일정이 곧 종료됩니다. 상세 캘린더에서 관리 중인 항목입니다.`;
  }

  return `${event.entityName} 관련 신청 일정의 마감 시각입니다. 상세 캘린더 기준으로만 노출합니다.`;
}

function buildClosingSoonCard(event) {
  return {
    id: event.id,
    title: event.title,
    keywordLabel: event.entityName,
    summary: buildClosingSoonSummary(event),
    closingAt: getCalendarDeadlineAt(event),
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl
  };
}

function buildSearchResultFromEvent(event) {
  return {
    id: `event-schedule-${event.id}`,
    kind: "schedule",
    sourceScope: "calendar",
    title: event.title,
    summary: `${event.entityName} 일정입니다. 상세 캘린더에 저장된 항목을 바로 확인할 수 있습니다.`,
    keywordLabel: event.entityName,
    referenceAt: event.startAt,
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl
  };
}

function buildSearchResultFromDeadlineEvent(event) {
  return {
    id: `event-deadline-${event.id}`,
    kind: "deadline",
    sourceScope: "calendar",
    title: event.title,
    summary: buildClosingSoonSummary(event),
    keywordLabel: event.entityName,
    referenceAt: getCalendarDeadlineAt(event),
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl
  };
}

function buildSearchResultFromDiscoveryItem(item) {
  return {
    id: item.id,
    kind: item.kind,
    sourceScope: "stored",
    title: item.title,
    summary: item.summary,
    keywordLabel: item.keywordLabel,
    referenceAt: item.publishedAt || item.occursAt || item.closingAt || null,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl
  };
}

function createGenericArticleSearchResults(query) {
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    return [];
  }

  const encodedQuery = encodeURIComponent(trimmedQuery);
  const now = new Date().toISOString();

  return [
    {
      id: `web-fallback-google-${encodedQuery}`,
      kind: "article",
      sourceScope: "web",
      title: `${trimmedQuery} 최신 기사 검색`,
      summary: `${trimmedQuery} 관련 최신 기사 결과를 Google 뉴스에서 바로 확인할 수 있습니다.`,
      keywordLabel: trimmedQuery,
      referenceAt: now,
      sourceName: "Google 뉴스",
      sourceUrl: `https://news.google.com/search?q=${encodedQuery}%20when%3A7d&hl=ko&gl=KR&ceid=KR%3Ako`
    },
    {
      id: `web-fallback-naver-${encodedQuery}`,
      kind: "article",
      sourceScope: "web",
      title: `${trimmedQuery} 네이버 뉴스 검색`,
      summary: `${trimmedQuery} 관련 기사와 블로그, 커뮤니티 반응을 네이버 검색으로 바로 확인할 수 있습니다.`,
      keywordLabel: trimmedQuery,
      referenceAt: now,
      sourceName: "Naver Search",
      sourceUrl: `https://search.naver.com/search.naver?where=news&query=${encodedQuery}`
    }
  ];
}

function buildSearchableText(item) {
  return normalizeText([item.title, item.summary, item.keywordLabel, item.sourceName].join(" "));
}

function dedupeSearchResults(results) {
  const fingerprints = new Set();

  return results.filter((result) => {
    const fingerprint = [result.kind, result.title, result.sourceUrl].join("|");

    if (fingerprints.has(fingerprint)) {
      return false;
    }

    fingerprints.add(fingerprint);
    return true;
  });
}

function getDashboard(user) {
  const subscribedKeywords = getSubscribedKeywords(user);
  const keywordLabels = subscribedKeywords.map((keyword) => keyword.label);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thisWeekEnd = endOfDay(addDays(now, 6));
  const relevantEvents = keywordLabels.length ? getEvents({ keyword: keywordLabels.join(",") }) : [];

  const upcomingEvents = relevantEvents
    .filter((event) => new Date(event.startAt).getTime() >= todayStart.getTime())
    .sort((left, right) => left.startAt.localeCompare(right.startAt));

  const todaySchedules = relevantEvents
    .filter((event) => {
      const eventTime = new Date(event.startAt).getTime();
      return eventTime >= todayStart.getTime() && eventTime <= todayEnd.getTime();
    })
    .map(buildScheduleCard);

  const weekSchedules = relevantEvents
    .filter((event) => {
      const eventTime = new Date(event.startAt).getTime();
      return eventTime >= now.getTime() && eventTime <= thisWeekEnd.getTime();
    })
    .map(buildScheduleCard);

  const dDayItems = upcomingEvents.slice(0, 4).map((event) => buildDDayCard(event, now));
  const closingSoonItems = relevantEvents
    .filter(isCalendarDeadlineEvent)
    .filter((event) => {
      const closingAt = getCalendarDeadlineAt(event);

      if (!closingAt) {
        return false;
      }

      const closingTime = new Date(closingAt).getTime();
      return closingTime >= now.getTime() && closingTime <= endOfDay(addDays(now, 14)).getTime();
    })
    .sort((left, right) => String(getCalendarDeadlineAt(left)).localeCompare(String(getCalendarDeadlineAt(right))))
    .slice(0, 4)
    .map(buildClosingSoonCard);

  const subscriptionKeywordIds = new Set(subscribedKeywords.map((keyword) => keyword.id));
  const nextHighlight = upcomingEvents[0]
    ? `${upcomingEvents[0].entityName} · ${upcomingEvents[0].title}`
    : null;

  return {
    userName: user.displayName,
    availableKeywords: interestKeywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.label,
      group: keyword.group,
      subscriberCount: keyword.subscriberCount,
      likeCount: keyword.likeCount
    })),
    subscribedKeywords: subscribedKeywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.label,
      group: keyword.group,
      subscriberCount: keyword.subscriberCount,
      likeCount: keyword.likeCount
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

async function searchDiscovery(user, query) {
  const trimmedQuery = String(query || "").trim();
  const normalizedQuery = normalizeText(trimmedQuery);
  const subscribedKeywords = getSubscribedKeywords(user);
  const subscriptionKeywordIds = new Set(subscribedKeywords.map((keyword) => keyword.id));
  const keywordLookup = buildKeywordLookup();
  const eventSearchFilters = normalizedQuery
    ? { search: trimmedQuery }
    : { keyword: subscribedKeywords.map((keyword) => keyword.label).join(",") };

  const matchedEvents = getEvents(eventSearchFilters);
  const localScheduleResults = matchedEvents.slice(0, 6).map(buildSearchResultFromEvent);
  const localDeadlineResults = matchedEvents
    .filter(isCalendarDeadlineEvent)
    .sort((left, right) => String(getCalendarDeadlineAt(left)).localeCompare(String(getCalendarDeadlineAt(right))))
    .slice(0, 4)
    .map(buildSearchResultFromDeadlineEvent);
  const localArticleResults = discoveryItems
    .filter((item) => item.kind === "article")
    .filter((item) => {
      if (!normalizedQuery) {
        return subscriptionKeywordIds.has(item.keywordId);
      }

      return buildSearchableText(item).includes(normalizedQuery);
    })
    .slice(0, 4)
    .map(buildSearchResultFromDiscoveryItem);
  const fetchedWebResults = normalizedQuery ? await fetchLatestWebArticles(trimmedQuery) : [];
  const webResults = fetchedWebResults.length
    ? fetchedWebResults
    : normalizedQuery
      ? createGenericArticleSearchResults(trimmedQuery)
      : [];

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
    query: trimmedQuery,
    localResults: dedupeSearchResults([
      ...localScheduleResults,
      ...localDeadlineResults,
      ...localArticleResults
    ]),
    webResults: dedupeSearchResults(webResults),
    relatedKeywords
  };
}

module.exports = {
  getDashboard,
  searchDiscovery
};
