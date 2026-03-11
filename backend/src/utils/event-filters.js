function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildSearchableText(event) {
  return normalizeText(
    [
      event.title,
      event.entityName,
      event.category,
      event.sourceName,
      event.sourceType,
      ...(event.tags || [])
    ].join(" ")
  );
}

function parseMultiValue(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isSameMonth(isoDateTime, monthKey) {
  return typeof isoDateTime === "string" && isoDateTime.slice(0, 7) === monthKey;
}

function matchesSearch(event, search) {
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableText = buildSearchableText(event);

  if (searchableText.includes(normalizedSearch)) {
    return true;
  }

  const stopwords = new Set(["이번", "이번주", "이번달", "뭐", "있어", "있나", "행사", "일정", "보여줘", "알려줘"]);
  const tokens = normalizedSearch
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopwords.has(token));

  if (tokens.length === 0) {
    return true;
  }

  return tokens.some((token) => searchableText.includes(token));
}

function matchesAnyKeyword(event, keywords) {
  if (!keywords.length) {
    return true;
  }

  const searchableText = buildSearchableText(event);
  return keywords.some((keyword) => searchableText.includes(normalizeText(keyword)));
}

module.exports = {
  buildSearchableText,
  isSameMonth,
  matchesAnyKeyword,
  matchesSearch,
  normalizeText,
  parseMultiValue
};
