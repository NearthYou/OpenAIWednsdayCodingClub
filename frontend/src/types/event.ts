export type EventCategory =
  | "artist"
  | "anime_game"
  | "goods_release"
  | "birthday"
  | "fan_event";

export type SourceType = "official" | "community" | "rumor";

export interface EventItem {
  id: string;
  title: string;
  entityName: string;
  category: EventCategory;
  startAt: string;
  endAt?: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: SourceType;
  isOfficial: boolean;
  tags: string[];
}

export interface SavedScheduleItem {
  id: string;
  sourceEventId: string | null;
  title: string;
  entityName: string;
  typeLabel: string;
  dateKey: string;
  startAt: string | null;
  endAt: string | null;
  sourceName: string;
  sourceUrl: string;
  tags: string[];
  savedAt: string;
}

export interface InterestKeyword {
  id: string;
  label: string;
  group: string;
}

export interface KeywordRecommendation {
  id: string;
  label: string;
  group: string;
  score: number;
  source: "selected" | "recommended";
  reason: string;
}

export interface EventAiSummary {
  statusMessage: string;
  summaryPoints: string[];
  highlightSchedule: string;
  highlightSourceStatus: string;
  highlightFanCheckpoint: string;
  reservationGuide: string;
  bonusGuide: string;
  verificationGuide: string;
}

export interface EventAiSummaryMeta {
  provider: string;
  model: string;
  generatedAt: string;
}

export interface EventFilters {
  searchQuery: string;
  selectedCategories: EventCategory[];
  selectedSourceTypes: SourceType[];
  selectedInterestKeywords: string[];
}
