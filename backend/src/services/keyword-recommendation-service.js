const { interestKeywords } = require("../data/interest-keywords");

const keywordProfiles = {
  "keyword-ive": {
    tags: ["kpop", "girl-group", "performance", "photocard"],
    connections: {
      "keyword-lesserafim": 3.2,
      "keyword-aespa": 3
    }
  },
  "keyword-lesserafim": {
    tags: ["kpop", "girl-group", "performance", "photocard"],
    connections: {
      "keyword-ive": 3.2,
      "keyword-aespa": 2.8
    }
  },
  "keyword-aespa": {
    tags: ["kpop", "girl-group", "performance", "photocard", "pop-up"],
    connections: {
      "keyword-ive": 2.9,
      "keyword-lesserafim": 2.7,
      "keyword-miku": 1.2
    }
  },
  "keyword-bluearchive": {
    tags: ["anime-game", "gacha", "goods", "collab-cafe"],
    connections: {
      "keyword-genshin": 2.6,
      "keyword-starrail": 3.3,
      "keyword-zenless": 3.1
    }
  },
  "keyword-genshin": {
    tags: ["anime-game", "gacha", "broadcast", "goods"],
    connections: {
      "keyword-starrail": 3.6,
      "keyword-zenless": 2.9,
      "keyword-bluearchive": 2
    }
  },
  "keyword-starrail": {
    tags: ["anime-game", "gacha", "broadcast", "goods"],
    connections: {
      "keyword-genshin": 3.6,
      "keyword-zenless": 3.1,
      "keyword-bluearchive": 2.4
    }
  },
  "keyword-zenless": {
    tags: ["anime-game", "gacha", "collab-cafe", "goods"],
    connections: {
      "keyword-starrail": 3,
      "keyword-genshin": 2.8,
      "keyword-bluearchive": 2.5
    }
  },
  "keyword-miku": {
    tags: ["virtual", "music", "figure", "collab"],
    connections: {
      "keyword-aespa": 1.4,
      "keyword-pokemon": 1.3,
      "keyword-onepiece": 1
    }
  },
  "keyword-onepiece": {
    tags: ["anime", "exhibition", "goods", "pop-up"],
    connections: {
      "keyword-conan": 2.2,
      "keyword-demonslayer": 2.7,
      "keyword-pokemon": 1.7
    }
  },
  "keyword-conan": {
    tags: ["anime", "movie", "exhibition", "goods"],
    connections: {
      "keyword-onepiece": 2,
      "keyword-demonslayer": 2.1,
      "keyword-pokemon": 1.5
    }
  },
  "keyword-demonslayer": {
    tags: ["anime", "exhibition", "ticket", "goods"],
    connections: {
      "keyword-onepiece": 2.6,
      "keyword-conan": 2,
      "keyword-pokemon": 1.2
    }
  },
  "keyword-pokemon": {
    tags: ["character", "goods", "pop-up", "family"],
    connections: {
      "keyword-onepiece": 1.8,
      "keyword-conan": 1.3,
      "keyword-miku": 1.2
    }
  }
};

const keywordLookup = new Map(interestKeywords.map((keyword) => [keyword.id, keyword]));

function normalizeSeedKeywordIds(seedKeywordIds) {
  const validKeywordIds = new Set(interestKeywords.map((keyword) => keyword.id));

  return Array.isArray(seedKeywordIds)
    ? [...new Set(seedKeywordIds.map((keywordId) => String(keywordId).trim()).filter((keywordId) => validKeywordIds.has(keywordId)))]
    : [];
}

function getKeywordProfile(keywordId) {
  return keywordProfiles[keywordId] || { tags: [], connections: {} };
}

function recommendKeywords(seedKeywordIds, options = {}) {
  const normalizedSeedKeywordIds = normalizeSeedKeywordIds(seedKeywordIds);
  const recommendationLimit = Math.max(normalizedSeedKeywordIds.length, options.limit || 6);
  const seedKeywordIdSet = new Set(normalizedSeedKeywordIds);
  const scores = new Map();
  const reasons = new Map();

  function addScore(keywordId, value, reason) {
    if (!keywordLookup.has(keywordId) || value <= 0) {
      return;
    }

    scores.set(keywordId, (scores.get(keywordId) || 0) + value);

    const keywordReasons = reasons.get(keywordId) || [];
    keywordReasons.push({ value, reason });
    reasons.set(keywordId, keywordReasons);
  }

  normalizedSeedKeywordIds.forEach((seedKeywordId) => {
    const seedKeyword = keywordLookup.get(seedKeywordId);

    if (!seedKeyword) {
      return;
    }

    const seedProfile = getKeywordProfile(seedKeywordId);
    addScore(seedKeywordId, 10, `${seedKeyword.label} 직접 선택`);

    interestKeywords.forEach((keyword) => {
      if (keyword.id === seedKeywordId) {
        return;
      }

      const currentProfile = getKeywordProfile(keyword.id);
      const sharedTags = currentProfile.tags.filter((tag) => seedProfile.tags.includes(tag));

      if (sharedTags.length > 0) {
        addScore(keyword.id, sharedTags.length * 1.25, `${seedKeyword.label} 취향과 태그가 비슷함`);
      }

      if (keyword.group === seedKeyword.group) {
        addScore(keyword.id, 0.9, `${seedKeyword.group} 그룹 선호`);
      }
    });

    Object.entries(seedProfile.connections).forEach(([relatedKeywordId, weight]) => {
      addScore(relatedKeywordId, weight, `${seedKeyword.label} 팬덤과 교집합이 큼`);
    });
  });

  const recommendations = interestKeywords
    .filter((keyword) => scores.has(keyword.id))
    .map((keyword) => {
      const keywordReasons = (reasons.get(keyword.id) || []).sort((left, right) => right.value - left.value);

      return {
        id: keyword.id,
        label: keyword.label,
        group: keyword.group,
        score: Number((scores.get(keyword.id) || 0).toFixed(2)),
        source: seedKeywordIdSet.has(keyword.id) ? "selected" : "recommended",
        reason: keywordReasons[0]?.reason || "선택한 취향과 가까운 키워드"
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.source !== right.source) {
        return left.source === "selected" ? -1 : 1;
      }

      return left.label.localeCompare(right.label, "ko");
    })
    .slice(0, recommendationLimit);

  return {
    seedKeywordIds: normalizedSeedKeywordIds,
    recommendedKeywordIds: recommendations.map((keyword) => keyword.id),
    recommendations
  };
}

module.exports = {
  normalizeSeedKeywordIds,
  recommendKeywords
};
