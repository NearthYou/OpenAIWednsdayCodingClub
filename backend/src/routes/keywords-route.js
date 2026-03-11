const express = require("express");
const { interestKeywords } = require("../data/interest-keywords");

const router = express.Router();

router.get("/", (request, response) => {
  response.json({
    count: interestKeywords.length,
    keywords: interestKeywords
  });
});

module.exports = router;
