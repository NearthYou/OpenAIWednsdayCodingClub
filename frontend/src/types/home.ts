import type { SourceType } from "./event";

export type HomeSearchResultKind = "article" | "schedule" | "deadline";
export type HomeSearchSourceScope = "calendar" | "stored" | "web";

export interface HomeKeywordOption {
  id: string;
  label: string;
  group: string;
  subscriberCount: number;
  likeCount: number;
}

export interface HomeScheduleSummary {
  id: string;
  title: string;
  entityName: string;
  startAt: string;
  endAt: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  tags: string[];
}

export interface HomeDdaySummary {
  id: string;
  title: string;
  entityName: string;
  startAt: string;
  sourceName: string;
  sourceUrl: string;
  daysRemaining: number;
  ddayLabel: string;
}

export interface ClosingSoonSummary {
  id: string;
  title: string;
  keywordLabel: string;
  summary: string;
  closingAt: string;
  sourceName: string;
  sourceUrl: string;
}

export interface TrendingKeywordSummary {
  keywordId: string;
  label: string;
  searchCount: number;
  momentum: string;
  isSubscribed: boolean;
}

export interface HomeDashboardPayload {
  userName: string;
  availableKeywords: HomeKeywordOption[];
  subscribedKeywords: HomeKeywordOption[];
  nextHighlight: string | null;
  todaySchedules: HomeScheduleSummary[];
  weekSchedules: HomeScheduleSummary[];
  dDayItems: HomeDdaySummary[];
  closingSoonItems: ClosingSoonSummary[];
  trendingKeywords: TrendingKeywordSummary[];
}

export interface HomeSearchResult {
  id: string;
  kind: HomeSearchResultKind;
  sourceScope: HomeSearchSourceScope;
  title: string;
  summary: string;
  keywordLabel: string;
  referenceAt: string | null;
  sourceName: string;
  sourceUrl: string;
}

export interface HomeSearchResponse {
  query: string;
  localResults: HomeSearchResult[];
  webResults: HomeSearchResult[];
  relatedKeywords: TrendingKeywordSummary[];
}
