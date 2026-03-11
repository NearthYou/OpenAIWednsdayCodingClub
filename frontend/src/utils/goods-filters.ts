import type { GoodsFilters, GoodsItem } from "../types/goods";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function buildSearchText(item: GoodsItem) {
  return normalizeText(
    [
      item.title,
      item.entityName,
      item.releaseType,
      item.vendorName,
      item.sourceName,
      item.pickupMode,
      item.stockNote,
      item.spotlight,
      ...item.tags
    ].join(" ")
  );
}

function matchesSearch(item: GoodsItem, searchQuery: string) {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const searchText = buildSearchText(item);

  if (searchText.includes(normalizedQuery)) {
    return true;
  }

  const stopwords = new Set(["굿즈", "탐색", "추천", "뭐", "있어", "이번", "이번달", "보여줘"]);
  const tokens = normalizedQuery
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopwords.has(token));

  if (!tokens.length) {
    return true;
  }

  return tokens.some((token) => searchText.includes(token));
}

function matchesInterestKeywords(item: GoodsItem, selectedInterestKeywords: string[]) {
  if (!selectedInterestKeywords.length) {
    return true;
  }

  const searchText = buildSearchText(item);
  return selectedInterestKeywords.some((keyword) => searchText.includes(normalizeText(keyword)));
}

export function filterGoods(goods: GoodsItem[], filters: GoodsFilters) {
  return goods.filter((item) => {
    const matchesReleaseType =
      !filters.selectedReleaseTypes.length || filters.selectedReleaseTypes.includes(item.releaseType);
    const matchesSourceType =
      !filters.selectedSourceTypes.length || filters.selectedSourceTypes.includes(item.sourceType);

    return (
      matchesReleaseType &&
      matchesSourceType &&
      matchesInterestKeywords(item, filters.selectedInterestKeywords) &&
      matchesSearch(item, filters.searchQuery)
    );
  });
}
