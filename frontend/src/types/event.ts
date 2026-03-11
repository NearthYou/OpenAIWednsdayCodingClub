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

export interface InterestKeyword {
  id: string;
  label: string;
  group: string;
}

export interface EventFilters {
  searchQuery: string;
  selectedCategories: EventCategory[];
  selectedSourceTypes: SourceType[];
  selectedInterestKeywords: string[];
}
