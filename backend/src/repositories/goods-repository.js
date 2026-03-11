const { mockGoods } = require("../data/mock-goods");

function getAllGoods() {
  return mockGoods;
}

function getGoodsById(id) {
  return mockGoods.find((item) => item.id === id) || null;
}

module.exports = {
  getAllGoods,
  getGoodsById
};
