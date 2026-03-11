const express = require("express");
const { interestKeywords } = require("../data/interest-keywords");
const { recommendKeywords } = require("../services/keyword-recommendation-service");

const router = express.Router();

router.get("/", (request, response) => {
  response.json({
    count: interestKeywords.length,
    keywords: interestKeywords
  });
});

router.post("/recommendations", (request, response) => {
  const recommendationResult = recommendKeywords(request.body?.seedKeywordIds, {
    limit: 6
  });

  response.json(recommendationResult);
});

module.exports = router;
