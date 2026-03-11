const { getAllGoods, getGoodsById } = require("../repositories/goods-repository");
const {
  isSameMonth,
  matchesAnyKeyword,
  matchesSearch,
  parseMultiValue
} = require("../utils/event-filters");

function dedupeGoods(goods) {
  const seen = new Set();

  return goods.filter((item) => {
    const fingerprint = [item.title, item.entityName, item.startAt, item.sourceUrl].join("|");

    if (seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);
    return true;
  });
}

function getGoods(filters = {}) {
  const releaseTypes = parseMultiValue(filters.releaseType);
  const sourceTypes = parseMultiValue(filters.sourceType);
  const keywords = parseMultiValue(filters.keyword);

  return dedupeGoods(getAllGoods())
    .filter((item) => !filters.month || isSameMonth(item.startAt, filters.month))
    .filter((item) => !releaseTypes.length || releaseTypes.includes(item.releaseType))
    .filter((item) => !sourceTypes.length || sourceTypes.includes(item.sourceType))
    .filter((item) => matchesAnyKeyword(item, keywords))
    .filter((item) => matchesSearch(item, filters.search))
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
}

function getGoodsDetail(id) {
  const goodsItem = getGoodsById(id);

  if (!goodsItem) {
    return null;
  }

  const [dedupedItem] = dedupeGoods([goodsItem]);
  return dedupedItem || null;
}

module.exports = {
  getGoods,
  getGoodsDetail
};
