import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import type { EventItem, SourceType } from "../types/event";
import type {
  ClosingSoonSummary,
  HomeDdaySummary,
  HomeScheduleSummary,
  HomeSearchResult,
  HomeSearchResultKind
} from "../types/home";

export type DetailBadgeVariant = SourceType | HomeSearchResultKind;
export type DetailPageItemKind = "event" | "search" | "countdown" | "deadline" | "schedule";

export interface DetailPageItem {
  id: string;
  kind: DetailPageItemKind;
  sourceEventId: string | null;
  title: string;
  entityName: string;
  typeLabel: string;
  badgeLabel: string;
  badgeVariant: DetailBadgeVariant;
  startAt: string | null;
  endAt: string | null;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  tags: string[];
  venueGuide: string;
  eventData: EventItem | null;
}

const SEARCH_KIND_LABELS: Record<HomeSearchResultKind, string> = {
  article: "기사",
  schedule: "일정",
  deadline: "마감"
};

function getSourceEventIdFromSearchResultId(resultId: string) {
  if (resultId.startsWith("event-schedule-")) {
    return resultId.slice("event-schedule-".length);
  }

  if (resultId.startsWith("event-deadline-")) {
    return resultId.slice("event-deadline-".length);
  }

  return null;
}

export function createDetailPageItemFromEvent(event: EventItem): DetailPageItem {
  return {
    id: event.id,
    kind: "event",
    sourceEventId: event.id,
    title: event.title,
    entityName: event.entityName,
    typeLabel: CATEGORY_LABELS[event.category],
    badgeLabel: SOURCE_TYPE_LABELS[event.sourceType],
    badgeVariant: event.sourceType,
    startAt: event.startAt,
    endAt: event.endAt || null,
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl,
    summary: `${event.entityName} 관련 ${CATEGORY_LABELS[event.category]} 일정입니다. 상세 정보와 다음 액션을 한 화면에서 확인할 수 있습니다.`,
    tags: [...event.tags],
    venueGuide: `${event.sourceName} 기준 상세 안내를 맨 아래 외부 링크에서 확인하세요.`,
    eventData: event
  };
}

export function createDetailPageItemFromHomeSchedule(item: HomeScheduleSummary): DetailPageItem {
  return {
    id: item.id,
    kind: "schedule",
    sourceEventId: item.id,
    title: item.title,
    entityName: item.entityName,
    typeLabel: "오늘 일정",
    badgeLabel: SOURCE_TYPE_LABELS[item.sourceType],
    badgeVariant: item.sourceType,
    startAt: item.startAt,
    endAt: item.endAt,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    summary: `${item.entityName} 관련 오늘 일정입니다. 지금 확인하고 바로 캘린더에 추가할 수 있습니다.`,
    tags: [...item.tags],
    venueGuide: `${item.sourceName} 상세 공지 기준으로 준비물을 다시 확인하세요.`,
    eventData: null
  };
}

export function createDetailPageItemFromHomeSearchResult(result: HomeSearchResult): DetailPageItem {
  return {
    id: result.id,
    kind: "search",
    sourceEventId: getSourceEventIdFromSearchResultId(result.id),
    title: result.title,
    entityName: result.keywordLabel,
    typeLabel: `${SEARCH_KIND_LABELS[result.kind]} 검색 결과`,
    badgeLabel: SEARCH_KIND_LABELS[result.kind],
    badgeVariant: result.kind,
    startAt: result.referenceAt,
    endAt: null,
    sourceName: result.sourceName,
    sourceUrl: result.sourceUrl,
    summary: result.summary,
    tags: result.keywordLabel ? [result.keywordLabel] : [],
    venueGuide: `${result.sourceName}에 연결된 정보입니다. 외부 사이트 이동은 맨 아래에서 할 수 있습니다.`,
    eventData: null
  };
}

export function createDetailPageItemFromHomeDday(item: HomeDdaySummary): DetailPageItem {
  return {
    id: item.id,
    kind: "countdown",
    sourceEventId: item.id,
    title: item.title,
    entityName: item.entityName,
    typeLabel: "다가오는 구독 일정",
    badgeLabel: "일정",
    badgeVariant: "schedule",
    startAt: item.startAt,
    endAt: null,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    summary: `${item.ddayLabel} 일정입니다. 다가오는 구독 일정을 바로 저장하거나 공유할 수 있습니다.`,
    tags: [item.ddayLabel],
    venueGuide: `${item.sourceName} 일정 상세를 맨 아래 외부 링크에서 확인하세요.`,
    eventData: null
  };
}

export function createDetailPageItemFromClosingSoon(item: ClosingSoonSummary): DetailPageItem {
  return {
    id: item.id,
    kind: "deadline",
    sourceEventId: item.id,
    title: item.title,
    entityName: item.keywordLabel,
    typeLabel: "마감 임박 항목",
    badgeLabel: "마감",
    badgeVariant: "deadline",
    startAt: item.closingAt,
    endAt: null,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    summary: item.summary,
    tags: [item.keywordLabel, "마감 임박"],
    venueGuide: `${item.sourceName}에서 마감 시간을 다시 확인하세요.`,
    eventData: null
  };
}
