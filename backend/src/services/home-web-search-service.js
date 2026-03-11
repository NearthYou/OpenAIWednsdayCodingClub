const { createHash } = require("crypto");

const GOOGLE_NEWS_SEARCH_URL = "https://news.google.com/rss/search";
const GOOGLE_NEWS_TIMEOUT_MS = 7000;
const GOOGLE_NEWS_RESULT_LIMIT = 4;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtml(value) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagContent(block, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = String(block || "").match(pattern);
  return match ? decodeHtmlEntities(match[1]) : "";
}

function buildGoogleNewsSearchUrl(query) {
  const searchParams = new URLSearchParams({
    q: `${query} when:7d`,
    hl: "ko",
    gl: "KR",
    ceid: "KR:ko"
  });

  return `${GOOGLE_NEWS_SEARCH_URL}?${searchParams.toString()}`;
}

function normalizeArticleTitle(title, sourceName) {
  const normalizedTitle = String(title || "").trim();
  const normalizedSourceName = String(sourceName || "").trim();

  if (!normalizedSourceName) {
    return normalizedTitle;
  }

  const suffix = ` - ${normalizedSourceName}`;
  return normalizedTitle.endsWith(suffix)
    ? normalizedTitle.slice(0, normalizedTitle.length - suffix.length).trim()
    : normalizedTitle;
}

function buildArticleSummary(description, normalizedTitle, sourceName) {
  const strippedDescription = stripHtml(description);
  let summary = strippedDescription
    .replace(new RegExp(escapeRegExp(normalizedTitle), "i"), "")
    .replace(new RegExp(`^${escapeRegExp(sourceName)}\\s*`, "i"), "")
    .trim();

  if (!summary || summary === sourceName) {
    summary = `${sourceName || "웹"} 최신 기사입니다. 검색 결과에서 바로 확인할 수 있습니다.`;
  }

  return summary;
}

function toIsoString(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function createWebResultId(sourceUrl) {
  return `web-${createHash("sha1").update(String(sourceUrl || "")).digest("hex").slice(0, 16)}`;
}

function parseGoogleNewsResults(xml, query) {
  return [...String(xml || "").matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1])
    .map((itemBlock) => {
      const sourceName = extractTagContent(itemBlock, "source") || "Google 뉴스";
      const title = normalizeArticleTitle(extractTagContent(itemBlock, "title"), sourceName);
      const sourceUrl = extractTagContent(itemBlock, "link");
      const referenceAt = toIsoString(extractTagContent(itemBlock, "pubDate"));

      if (!title || !sourceUrl) {
        return null;
      }

      return {
        id: createWebResultId(sourceUrl),
        kind: "article",
        sourceScope: "web",
        title,
        summary: buildArticleSummary(extractTagContent(itemBlock, "description"), title, sourceName),
        keywordLabel: query,
        referenceAt,
        sourceName,
        sourceUrl
      };
    })
    .filter(Boolean)
    .sort((left, right) => String(right.referenceAt || "").localeCompare(String(left.referenceAt || "")))
    .slice(0, GOOGLE_NEWS_RESULT_LIMIT);
}

async function fetchLatestWebArticles(query) {
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GOOGLE_NEWS_TIMEOUT_MS);

  try {
    const response = await fetch(buildGoogleNewsSearchUrl(trimmedQuery), {
      signal: controller.signal,
      headers: {
        "user-agent": "DucktongSagoMVP/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Google News RSS request failed with status ${response.status}`);
    }

    const xml = await response.text();
    return parseGoogleNewsResults(xml, trimmedQuery);
  } catch (error) {
    console.error("Failed to fetch latest web articles for the home search", error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  fetchLatestWebArticles
};
