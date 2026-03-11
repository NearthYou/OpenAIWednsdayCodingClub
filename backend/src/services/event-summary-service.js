const OpenAI = require("openai");

const CATEGORY_LABELS = {
  artist: "연예인",
  anime_game: "애니 / 게임",
  goods_release: "굿즈 발매",
  birthday: "생일",
  fan_event: "팬 이벤트"
};

const SOURCE_TYPE_LABELS = {
  official: "공식",
  community: "커뮤니티",
  rumor: "루머"
};

const EVENT_SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    statusMessage: { type: "string" },
    summaryPoints: {
      type: "array",
      items: { type: "string" }
    },
    highlightSchedule: { type: "string" },
    highlightSourceStatus: { type: "string" },
    highlightFanCheckpoint: { type: "string" },
    reservationGuide: { type: "string" },
    bonusGuide: { type: "string" },
    verificationGuide: { type: "string" }
  },
  required: [
    "statusMessage",
    "summaryPoints",
    "highlightSchedule",
    "highlightSourceStatus",
    "highlightFanCheckpoint",
    "reservationGuide",
    "bonusGuide",
    "verificationGuide"
  ]
};

class MissingOpenAiApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured. Add it to .env or backend/.env to enable live AI summaries.");
    this.name = "MissingOpenAiApiKeyError";
  }
}

function getOpenAiErrorPayload(error) {
  if (error instanceof MissingOpenAiApiKeyError) {
    return {
      status: 503,
      code: "missing_api_key",
      message: error.message
    };
  }

  if (error?.status === 429 || error?.code === "insufficient_quota") {
    return {
      status: 429,
      code: "insufficient_quota",
      message:
        "OpenAI API 사용 한도를 초과했습니다. Platform billing 또는 사용량 한도를 확인한 뒤 다시 시도해 주세요."
    };
  }

  if (error?.status === 401) {
    return {
      status: 401,
      code: "invalid_api_key",
      message: "OpenAI API 키가 유효하지 않습니다. .env의 OPENAI_API_KEY를 확인해 주세요."
    };
  }

  if (error?.status === 403) {
    return {
      status: 403,
      code: "forbidden",
      message: "현재 OpenAI 프로젝트 또는 키 권한으로는 이 요청을 실행할 수 없습니다."
    };
  }

  if (error?.status >= 400 && error?.status < 600) {
    return {
      status: error.status,
      code: error.code || "openai_api_error",
      message:
        error?.error?.message ||
        error?.message ||
        "OpenAI 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
    };
  }

  return {
    status: 502,
    code: "summary_generation_failed",
    message: "OpenAI 요약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
  };
}

let openAiClient = null;

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new MissingOpenAiApiKeyError();
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openAiClient;
}

function getFallbackSummary(event) {
  const statusMessage =
    event.sourceType === "official"
      ? "공식 채널 기준으로 확인된 일정이라 바로 저장해도 좋은 상태입니다."
      : event.sourceType === "rumor"
        ? "루머 분류 일정이므로 저장 전 공식 채널 재확인이 필요합니다."
        : "팬 커뮤니티 기반 일정이라 공식 공지와 함께 비교해보는 것이 좋습니다.";

  const sourceGuide =
    event.sourceType === "official"
      ? "공식 출처 일정이라 우선 저장 후보로 보기 좋습니다."
      : event.sourceType === "community"
        ? "커뮤니티 제보 일정이라 공식 후속 공지를 함께 확인해야 합니다."
        : "루머 단계 정보라 공식 채널 재확인이 가장 중요합니다.";

  const followUpGuide =
    event.category === "goods_release"
      ? "판매 링크, 예약 일정, 재입고 공지를 이어서 체크하는 편이 좋습니다."
      : event.category === "fan_event"
        ? "참가 방식, 장소 공지, 준비물을 같이 확인하는 흐름이 안전합니다."
        : event.category === "birthday"
          ? "당일 공개 콘텐츠와 해시태그 이벤트 여부를 같이 살펴보는 것이 좋습니다."
          : "티켓, 후속 공지, 굿즈 연계 일정까지 같이 보는 편이 좋습니다.";

  const reservationGuide =
    event.tags.includes("예매") || event.tags.includes("예약")
      ? "예매 또는 예약 성격의 일정이라 오픈 직전 공지와 대기 동선을 미리 확인하는 편이 좋습니다."
      : event.category === "fan_event"
        ? "참가 신청 여부와 입장 조건을 먼저 체크하는 것이 좋습니다."
        : "별도 예약 정보가 없어도 공지 업데이트는 계속 확인하는 편이 안전합니다.";

  const bonusGuide =
    event.category === "goods_release"
      ? "특전, 한정 수량, 배송 일정처럼 판매 조건이 달라질 수 있는 정보를 같이 확인하세요."
      : event.category === "birthday"
        ? "생일 일러스트, 축전, 해시태그 이벤트처럼 당일 공개 콘텐츠가 추가될 수 있습니다."
        : "후속 공지, 현장 혜택, 동시 오픈 굿즈처럼 연계 정보를 같이 확인하세요.";

  const verificationGuide =
    event.sourceType === "official"
      ? "공식 채널 기준 일정이라 캘린더 반영 우선순위를 높여도 됩니다."
      : event.sourceType === "community"
        ? "커뮤니티 기반 일정이므로 공식 채널의 후속 공지를 한 번 더 확인하세요."
        : "루머 단계 정보라 저장 시 재확인 메모를 남겨두는 편이 안전합니다.";

  return {
    statusMessage,
    summaryPoints: [
      `${event.entityName} 관련 ${CATEGORY_LABELS[event.category]} 일정으로, 선택한 날짜에서 바로 확인할 가치가 있습니다.`,
      `${SOURCE_TYPE_LABELS[event.sourceType]} 출처인 ${event.sourceName} 기준 일정이라 팬이 기준 채널을 파악하기 쉽습니다.`,
      `${event.tags.length ? event.tags.map((tag) => `#${tag}`).join(" ") : "관련 태그 없음"} 흐름으로 보면 후속 일정도 함께 챙기기 좋습니다.`
    ],
    highlightSchedule: `${event.startAt}${event.endAt ? ` ~ ${event.endAt}` : ""}`,
    highlightSourceStatus: sourceGuide,
    highlightFanCheckpoint: followUpGuide,
    reservationGuide,
    bonusGuide,
    verificationGuide
  };
}

function normalizeText(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeSummary(summary, fallbackSummary) {
  const summaryPoints = Array.isArray(summary.summaryPoints)
    ? summary.summaryPoints
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 3)
    : [];

  while (summaryPoints.length < fallbackSummary.summaryPoints.length) {
    summaryPoints.push(fallbackSummary.summaryPoints[summaryPoints.length]);
  }

  return {
    statusMessage: normalizeText(summary.statusMessage, fallbackSummary.statusMessage),
    summaryPoints,
    highlightSchedule: normalizeText(summary.highlightSchedule, fallbackSummary.highlightSchedule),
    highlightSourceStatus: normalizeText(summary.highlightSourceStatus, fallbackSummary.highlightSourceStatus),
    highlightFanCheckpoint: normalizeText(summary.highlightFanCheckpoint, fallbackSummary.highlightFanCheckpoint),
    reservationGuide: normalizeText(summary.reservationGuide, fallbackSummary.reservationGuide),
    bonusGuide: normalizeText(summary.bonusGuide, fallbackSummary.bonusGuide),
    verificationGuide: normalizeText(summary.verificationGuide, fallbackSummary.verificationGuide)
  };
}

function buildSummaryPrompt(event) {
  return [
    "다음 이벤트 데이터를 바탕으로 한국어 팬 캘린더용 AI 요약 JSON을 생성하세요.",
    "반드시 제공된 사실만 사용하고, 없는 장소, 가격, 링크, 출연진, 특전은 지어내지 마세요.",
    "추론이 필요한 경우에는 '공식 채널 재확인', '공지 확인 필요'처럼 행동 가이드 문장으로 표현하세요.",
    "문장 톤은 간결하고 실용적으로 유지하세요.",
    "summaryPoints는 정확히 3개 문장으로 작성하세요.",
    "",
    `이벤트명: ${event.title}`,
    `키워드: ${event.entityName}`,
    `카테고리: ${CATEGORY_LABELS[event.category]}`,
    `시작 시각: ${event.startAt}`,
    `종료 시각: ${event.endAt || "정보 없음"}`,
    `출처 유형: ${SOURCE_TYPE_LABELS[event.sourceType]}`,
    `출처명: ${event.sourceName}`,
    `공식 여부: ${event.isOfficial ? "공식" : "비공식"}`,
    `태그: ${event.tags.length ? event.tags.join(", ") : "없음"}`,
    `출처 링크: ${event.sourceUrl}`
  ].join("\n");
}

async function generateEventSummary(event) {
  const client = getOpenAiClient();
  const fallbackSummary = getFallbackSummary(event);
  const model = process.env.OPENAI_SUMMARY_MODEL || "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You create short, factual Korean schedule summaries for fandom calendar users. Return valid JSON that matches the schema exactly."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildSummaryPrompt(event)
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "event_ai_summary",
        strict: true,
        schema: EVENT_SUMMARY_SCHEMA
      }
    }
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty summary response.");
  }

  const parsedSummary = JSON.parse(response.output_text);

  return {
    summary: normalizeSummary(parsedSummary, fallbackSummary),
    meta: {
      provider: "openai",
      model,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  MissingOpenAiApiKeyError,
  generateEventSummary,
  getOpenAiErrorPayload,
  getFallbackSummary
};
