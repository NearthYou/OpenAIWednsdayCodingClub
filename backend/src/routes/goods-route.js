const express = require("express");
const { getGoods, getGoodsDetail } = require("../services/goods-service");

const router = express.Router();

router.get("/", (request, response) => {
  const goods = getGoods(request.query);

  response.json({
    month: request.query.month || null,
    count: goods.length,
    goods
  });
});

router.get("/:id", (request, response) => {
  const goodsItem = getGoodsDetail(request.params.id);

  if (!goodsItem) {
    response.status(404).json({
      message: "Goods not found"
    });
    return;
  }

  response.json({ goods: goodsItem });
});

module.exports = router;
