import type { EventFilters, EventItem } from "../types/event";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function buildSearchText(event: EventItem) {
  return normalizeText(
    [
      event.title,
      event.entityName,
      event.category,
      event.sourceName,
      event.sourceType,
      ...event.tags
    ].join(" ")
  );
}

function matchesSearch(event: EventItem, searchQuery: string) {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const searchText = buildSearchText(event);

  if (searchText.includes(normalizedQuery)) {
    return true;
  }

  const stopwords = new Set(["이번", "이번주", "이번달", "뭐", "있어", "있나", "행사", "일정", "보여줘", "알려줘"]);
  const tokens = normalizedQuery
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopwords.has(token));

  if (!tokens.length) {
    return true;
  }

  return tokens.some((token) => searchText.includes(token));
}

function matchesInterestKeywords(event: EventItem, selectedInterestKeywords: string[]) {
  if (!selectedInterestKeywords.length) {
    return true;
  }

  const searchText = buildSearchText(event);
  return selectedInterestKeywords.some((keyword) => searchText.includes(normalizeText(keyword)));
}

export function filterEvents(events: EventItem[], filters: EventFilters) {
  return events.filter((event) => {
    const matchesCategory =
      !filters.selectedCategories.length || filters.selectedCategories.includes(event.category);
    const matchesSourceType =
      !filters.selectedSourceTypes.length || filters.selectedSourceTypes.includes(event.sourceType);

    return (
      matchesCategory &&
      matchesSourceType &&
      matchesInterestKeywords(event, filters.selectedInterestKeywords) &&
      matchesSearch(event, filters.searchQuery)
    );
  });
}
