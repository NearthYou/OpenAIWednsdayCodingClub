import { XMLParser } from "fast-xml-parser";

export type MarketScope = "global" | "tech" | "korea";
export type Tone = "bullish" | "bearish" | "neutral";

type RawNewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

type ScopeConfig = {
  label: string;
  description: string;
  feeds: string[];
  fallbackNews: RawNewsItem[];
};

type TopicConfig = {
  label: string;
  patterns: string[];
  weight: number;
};

type AnalyzedStory = NewsCard & {
  leadKeyword: string;
  freshnessScore: number;
};

export type KeywordSignal = {
  label: string;
  count: number;
  tone: Tone;
  share: number;
};

export type NewsCard = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  tone: Tone;
  keywords: string[];
  note: string;
  reason: string;
  score: number;
};

export type MarketBrief = {
  scope: MarketScope;
  label: string;
  description: string;
  mode: "live" | "demo";
  generatedAt: string;
  overview: string;
  headlineCount: number;
  representativeCount: number;
  feedCount: number;
  sourceCount: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  strongestTone: Tone;
  signalLine: string[];
  keywordSignals: KeywordSignal[];
  topNews: NewsCard[];
};

export const MARKET_SCOPE_OPTIONS: Array<{
  value: MarketScope;
  label: string;
}> = [
  { value: "global", label: "글로벌" },
  { value: "tech", label: "빅테크" },
  { value: "korea", label: "국내" }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true
});

const positiveWords = [
  "rally",
  "gain",
  "beat",
  "surge",
  "strong",
  "record",
  "growth",
  "rise",
  "up",
  "jump",
  "recover",
  "boost",
  "optimism",
  "expansion",
  "상승",
  "급등",
  "호조",
  "강세",
  "성장",
  "확대",
  "개선",
  "반등"
];

const negativeWords = [
  "fall",
  "drop",
  "miss",
  "cut",
  "slump",
  "weak",
  "risk",
  "warning",
  "concern",
  "down",
  "selloff",
  "probe",
  "slowdown",
  "pressure",
  "하락",
  "급락",
  "부진",
  "약세",
  "우려",
  "경고",
  "둔화",
  "충격"
];

const topicConfigs: TopicConfig[] = [
  {
    label: "AI 반도체",
    patterns: ["nvidia", "chip", "semiconductor", "gpu", "hbm", "반도체", "엔비디아"],
    weight: 5
  },
  {
    label: "금리",
    patterns: ["fed", "rate", "inflation", "cpi", "fomc", "treasury", "금리", "물가"],
    weight: 5
  },
  {
    label: "빅테크 실적",
    patterns: ["earnings", "guidance", "microsoft", "apple", "meta", "amazon", "실적"],
    weight: 4
  },
  {
    label: "전기차",
    patterns: ["tesla", "ev", "battery", "electric vehicle", "전기차", "배터리"],
    weight: 4
  },
  {
    label: "국내 반도체",
    patterns: ["삼성전자", "sk하이닉스", "kospi", "코스피", "수출", "hbm"],
    weight: 5
  },
  {
    label: "에너지",
    patterns: ["oil", "gas", "energy", "원유", "가스", "전력"],
    weight: 3
  },
  {
    label: "환율·수급",
    patterns: ["dollar", "yen", "foreign investors", "환율", "외국인", "수급"],
    weight: 3
  }
];

function createGoogleNewsUrl(
  query: string,
  language: string,
  region: string,
  edition: string
) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${language}&gl=${region}&ceid=${edition}`;
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - 1000 * 60 * minutes).toISOString();
}

const scopeConfigs: Record<MarketScope, ScopeConfig> = {
  global: {
    label: "글로벌 시장",
    description: "다수의 글로벌 시장 뉴스를 모아 금리, 빅테크, 반도체 흐름을 요약합니다.",
    feeds: [
      createGoogleNewsUrl("stock market OR wall street OR dow OR nasdaq when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("earnings guidance OR profit warning stocks when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("inflation OR fed rate OR treasury yields stocks when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("Nvidia OR semiconductor OR AI server demand when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("oil prices OR commodity inflation stocks when:4d", "en-US", "US", "US:en")
    ],
    fallbackNews: [
      {
        title: "Chip stocks rally as AI server demand stays strong",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(55)
      },
      {
        title: "Fed speakers keep rate-cut hopes in check after inflation worries",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(80)
      },
      {
        title: "Big Tech earnings guidance lifts Nasdaq sentiment",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(110)
      },
      {
        title: "Oil prices rise and add pressure to transport stocks",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(170)
      },
      {
        title: "Treasury yields edge higher as inflation data stays sticky",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(240)
      },
      {
        title: "Amazon cloud optimism supports broader tech recovery",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(310)
      },
      {
        title: "EV makers face renewed margin pressure after price cuts",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(380)
      },
      {
        title: "Global fund managers add semiconductor exposure on growth outlook",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(430)
      }
    ]
  },
  tech: {
    label: "빅테크",
    description: "AI 인프라, 클라우드, 전기차, 대형 기술주 실적 이슈를 한 번에 봅니다.",
    feeds: [
      createGoogleNewsUrl("Nvidia OR AMD OR semiconductor OR AI chip when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("Microsoft OR Google cloud OR AI datacenter when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("Apple OR iPhone demand OR consumer electronics stocks when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("Tesla OR EV price cuts OR battery stocks when:4d", "en-US", "US", "US:en"),
      createGoogleNewsUrl("Big Tech earnings OR Nasdaq when:4d", "en-US", "US", "US:en")
    ],
    fallbackNews: [
      {
        title: "Nvidia suppliers gain on stronger AI chip demand outlook",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(42)
      },
      {
        title: "Microsoft cloud growth stays firm ahead of earnings",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(96)
      },
      {
        title: "Apple faces mixed demand signals as smartphone recovery slows",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(130)
      },
      {
        title: "Tesla shares slip as EV price pressure remains in focus",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(165)
      },
      {
        title: "Meta ad growth beats expectations and revives platform optimism",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(220)
      },
      {
        title: "Amazon accelerates AI infrastructure spending with fresh chip orders",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(255)
      },
      {
        title: "Battery makers warn of slower EV demand in key markets",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(320)
      },
      {
        title: "Nasdaq edges higher as software earnings remain resilient",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(390)
      }
    ]
  },
  korea: {
    label: "국내 시장",
    description: "국내 증시 기사 다수를 모아 코스피, 반도체, 수출, 환율 이슈를 요약합니다.",
    feeds: [
      createGoogleNewsUrl("코스피 OR 증시 OR 외국인 수급 when:4d", "ko", "KR", "KR:ko"),
      createGoogleNewsUrl("삼성전자 OR SK하이닉스 OR HBM when:4d", "ko", "KR", "KR:ko"),
      createGoogleNewsUrl("2차전지 OR 배터리주 OR 전기차 when:4d", "ko", "KR", "KR:ko"),
      createGoogleNewsUrl("수출 OR 환율 OR 반도체 수출 when:4d", "ko", "KR", "KR:ko"),
      createGoogleNewsUrl("금리 OR 한국은행 OR 물가 when:4d", "ko", "KR", "KR:ko")
    ],
    fallbackNews: [
      {
        title: "삼성전자와 SK하이닉스, HBM 기대감에 강세",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(38)
      },
      {
        title: "코스피, 미국 금리 경계감에 장중 혼조",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(72)
      },
      {
        title: "수출 지표 개선 기대에 반도체 장비주 상승",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(124)
      },
      {
        title: "배터리 업종, 수요 둔화 우려로 약세",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(160)
      },
      {
        title: "환율 안정에 외국인 수급 개선 기대",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(205)
      },
      {
        title: "한국은행 금리 동결 전망에 성장주 반등 시도",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(270)
      },
      {
        title: "코스닥 AI 소부장 종목, 수주 확대 기대감 부각",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(330)
      },
      {
        title: "전기차 둔화 우려에 2차전지 변동성 확대",
        link: "https://news.google.com",
        source: "Demo Feed",
        publishedAt: minutesAgo(395)
      }
    ]
  }
};

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "#text" in value) {
    const text = (value as { "#text"?: unknown })["#text"];
    return typeof text === "string" ? text : "";
  }

  return "";
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, " ");
}

function cleanTitle(title: string, source: string) {
  const suffix = ` - ${source}`;

  if (source && title.endsWith(suffix)) {
    return title.slice(0, -suffix.length).trim();
  }

  return title.trim();
}

function parseDate(dateText: string) {
  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function detectTone(text: string): Tone {
  const normalized = normalizeText(text);
  const positiveHits = positiveWords.filter((word) => normalized.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => normalized.includes(word)).length;

  if (positiveHits > negativeHits) {
    return "bullish";
  }

  if (negativeHits > positiveHits) {
    return "bearish";
  }

  return "neutral";
}

function detectTopics(text: string): TopicConfig[] {
  const normalized = normalizeText(text);

  const matched = topicConfigs.filter((topic) =>
    topic.patterns.some((pattern) => normalized.includes(pattern.toLowerCase()))
  );

  if (matched.length > 0) {
    return matched.sort((left, right) => right.weight - left.weight).slice(0, 3);
  }

  if (normalized.includes("market") || normalized.includes("증시")) {
    return [
      {
        label: "시장 심리",
        patterns: [],
        weight: 2
      }
    ];
  }

  return [
    {
      label: "관망",
      patterns: [],
      weight: 1
    }
  ];
}

function toneLabel(tone: Tone) {
  if (tone === "bullish") {
    return "긍정";
  }

  if (tone === "bearish") {
    return "부정";
  }

  return "중립";
}

function buildNote(tone: Tone, leadKeyword: string) {
  if (tone === "bullish") {
    return `${leadKeyword} 쪽 기대감이 반영된 기사입니다.`;
  }

  if (tone === "bearish") {
    return `${leadKeyword} 관련 부담이 강조된 기사입니다.`;
  }

  return `${leadKeyword} 흐름을 중립적으로 확인하는 기사입니다.`;
}

function buildReason(story: AnalyzedStory, keywordRank: number) {
  const keywordLead = story.keywords[0] ?? "시장 심리";
  const keywordSummary =
    keywordRank <= 2
      ? `상위 ${keywordRank}위 핵심 키워드`
      : `${keywordLead} 대표 키워드`;

  if (story.freshnessScore >= 2.5) {
    return `${keywordSummary}에서 비교적 최근 올라온 기사라 대표 뉴스로 선택했습니다.`;
  }

  return `${keywordSummary} 기사 중 관련성이 높아 대표 뉴스로 선택했습니다.`;
}

function toHoursOld(dateText: string) {
  return Math.max(0, (Date.now() - parseDate(dateText).getTime()) / (1000 * 60 * 60));
}

function scoreStory(title: string, topics: TopicConfig[], tone: Tone, publishedAt: string) {
  const topicScore = topics.reduce((sum, topic) => sum + topic.weight, 0);
  const freshnessScore = Math.max(0.4, 4 - Math.min(toHoursOld(publishedAt), 36) / 10);
  const toneScore = tone === "bullish" ? 2.4 : tone === "bearish" ? 2 : 1.2;
  const lengthScore = title.length < 110 ? 0.8 : 0.3;

  return {
    total: Number((topicScore + freshnessScore + toneScore + lengthScore).toFixed(2)),
    freshnessScore
  };
}

function sortStories(left: AnalyzedStory, right: AnalyzedStory) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return parseDate(right.publishedAt).getTime() - parseDate(left.publishedAt).getTime();
}

function buildStories(scope: MarketScope, items: RawNewsItem[]) {
  return items
    .map((item, index) => {
      const title = cleanTitle(item.title, item.source);
      const topics = detectTopics(title);
      const tone = detectTone(title);
      const publishedAt = parseDate(item.publishedAt).toISOString();
      const keywords = topics.map((topic) => topic.label).slice(0, 3);
      const leadKeyword = keywords[0] ?? "관망";
      const score = scoreStory(title, topics, tone, publishedAt);

      return {
        id: `${scope}-${index}-${title.slice(0, 18)}`,
        title,
        link: item.link,
        source: item.source || "Unknown",
        publishedAt,
        tone,
        keywords,
        leadKeyword,
        note: buildNote(tone, leadKeyword),
        reason: "",
        freshnessScore: score.freshnessScore,
        score: score.total
      } satisfies AnalyzedStory;
    })
    .sort(sortStories);
}

function pickRepresentativeStories(
  stories: AnalyzedStory[],
  keywordSignals: KeywordSignal[]
): NewsCard[] {
  const selected: AnalyzedStory[] = [];
  const usedIds = new Set<string>();
  const keywordRankMap = new Map(keywordSignals.map((signal, index) => [signal.label, index + 1]));

  for (const signal of keywordSignals) {
    const candidate = stories.find(
      (story) => story.leadKeyword === signal.label && !usedIds.has(story.id)
    );

    if (!candidate) {
      continue;
    }

    usedIds.add(candidate.id);
    selected.push({
      ...candidate,
      reason: buildReason(candidate, keywordRankMap.get(candidate.leadKeyword) ?? 3)
    });

    if (selected.length === 4) {
      return selected;
    }
  }

  for (const story of stories) {
    if (usedIds.has(story.id)) {
      continue;
    }

    usedIds.add(story.id);
    selected.push({
      ...story,
      reason: buildReason(story, keywordRankMap.get(story.leadKeyword) ?? 3)
    });

    if (selected.length === 4) {
      break;
    }
  }

  return selected;
}

function analyze(scope: MarketScope, items: RawNewsItem[], mode: "live" | "demo"): MarketBrief {
  const config = scopeConfigs[scope];
  const stories = buildStories(scope, items);

  const keywordMap = new Map<
    string,
    {
      count: number;
      bullish: number;
      bearish: number;
    }
  >();

  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;

  for (const story of stories) {
    if (story.tone === "bullish") {
      bullishCount += 1;
    } else if (story.tone === "bearish") {
      bearishCount += 1;
    } else {
      neutralCount += 1;
    }

    for (const keyword of new Set(story.keywords)) {
      const current = keywordMap.get(keyword) ?? {
        count: 0,
        bullish: 0,
        bearish: 0
      };

      current.count += 1;

      if (story.tone === "bullish") {
        current.bullish += 1;
      } else if (story.tone === "bearish") {
        current.bearish += 1;
      }

      keywordMap.set(keyword, current);
    }
  }

  const headlineCount = stories.length;
  const keywordSignals = Array.from(keywordMap.entries())
    .map(([label, value]) => {
      let tone: Tone = "neutral";

      if (value.bullish > value.bearish) {
        tone = "bullish";
      } else if (value.bearish > value.bullish) {
        tone = "bearish";
      }

      return {
        label,
        count: value.count,
        tone,
        share: headlineCount === 0 ? 0 : Math.round((value.count / headlineCount) * 100)
      } satisfies KeywordSignal;
    })
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return right.share - left.share;
    })
    .slice(0, 6);

  const strongestTone =
    bullishCount > bearishCount
      ? "bullish"
      : bearishCount > bullishCount
        ? "bearish"
        : "neutral";

  const leadKeywords = keywordSignals.slice(0, 2).map((signal) => signal.label).join(", ");
  const overview =
    strongestTone === "bullish"
      ? `${leadKeywords || "핵심 키워드"} 중심으로 긍정 기사가 더 많아 위험 선호가 우세합니다.`
      : strongestTone === "bearish"
        ? `${leadKeywords || "핵심 키워드"} 관련 부담 기사가 많아 경계 심리가 우세합니다.`
        : `${leadKeywords || "핵심 키워드"} 이슈가 섞여 있어 방향성보다 관망 흐름이 강합니다.`;

  const topNews = pickRepresentativeStories(stories, keywordSignals);
  const signalLine =
    keywordSignals.length > 0
      ? keywordSignals.slice(0, 4).map((signal) => `${signal.label} ${signal.share}%`)
      : ["관망 100%"];

  return {
    scope,
    label: config.label,
    description: config.description,
    mode,
    generatedAt: new Date().toISOString(),
    overview,
    headlineCount,
    representativeCount: topNews.length,
    feedCount: config.feeds.length,
    sourceCount: new Set(stories.map((story) => story.source)).size,
    bullishCount,
    bearishCount,
    neutralCount,
    strongestTone,
    signalLine,
    keywordSignals,
    topNews
  };
}

async function fetchFeed(url: string): Promise<RawNewsItem[]> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    next: {
      revalidate: 600
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as {
    rss?: {
      channel?: {
        item?: unknown;
      };
    };
  };
  const rawItems = ensureArray(parsed.rss?.channel?.item);

  return rawItems
    .map((item) => {
      const rssItem = item as Record<string, unknown>;
      const title = getText(rssItem.title);
      const link = getText(rssItem.link);

      return {
        title,
        link,
        source: getText(rssItem.source) || "Google News",
        publishedAt: getText(rssItem.pubDate) || new Date().toISOString()
      } satisfies RawNewsItem;
    })
    .filter((item) => item.title && item.link)
    .slice(0, 12);
}

function dedupe(items: RawNewsItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = cleanTitle(item.title, item.source).toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function isMarketScope(value: string | null): value is MarketScope {
  return value === "global" || value === "tech" || value === "korea";
}

export function getFallbackBrief(scope: MarketScope): MarketBrief {
  return analyze(scope, scopeConfigs[scope].fallbackNews, "demo");
}

export async function getMarketBrief(scope: MarketScope): Promise<MarketBrief> {
  const config = scopeConfigs[scope];

  try {
    const feedResults = await Promise.all(config.feeds.map((feed) => fetchFeed(feed)));
    const liveItems = dedupe(feedResults.flat()).slice(0, 36);

    if (liveItems.length > 0) {
      return analyze(scope, liveItems, "live");
    }
  } catch {
    return getFallbackBrief(scope);
  }

  return getFallbackBrief(scope);
}

export function getToneText(tone: Tone) {
  return toneLabel(tone);
}
