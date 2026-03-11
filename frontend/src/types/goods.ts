import type { SourceType } from "./event";

export type GoodsReleaseType = "reservation" | "onsite" | "lottery" | "restock";
export type GoodsPickupMode = "shipping" | "onsite" | "mixed";

export interface GoodsItem {
  id: string;
  title: string;
  entityName: string;
  releaseType: GoodsReleaseType;
  startAt: string;
  endAt?: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: SourceType;
  isOfficial: boolean;
  vendorName: string;
  priceLabel: string;
  pickupMode: GoodsPickupMode;
  stockNote: string;
  spotlight: string;
  tags: string[];
}

export interface GoodsFilters {
  searchQuery: string;
  selectedReleaseTypes: GoodsReleaseType[];
  selectedSourceTypes: SourceType[];
  selectedInterestKeywords: string[];
}
