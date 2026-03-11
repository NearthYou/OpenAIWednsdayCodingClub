export type ThemeId =
  | "ai"
  | "semiconductor"
  | "ev-battery"
  | "robot"
  | "nuclear"
  | "cloud";

export interface Theme {
  id: ThemeId;
  label: string;
  summary: string;
  aliases: string[];
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  market: string;
  country: string;
  description: string;
  aliases: string[];
  themes: ThemeId[];
  reasons: Partial<Record<ThemeId, string>>;
}

export interface MatchedCompany extends Company {
  score: number;
  matchedThemes: ThemeId[];
  relationship: string;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface NewsHeadline {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskGuideItem {
  level: RiskLevel;
  score: number;
  summary: string;
  factors: string[];
}

export interface RiskGuide {
  disclaimer: string;
  buy: RiskGuideItem;
  sell: RiskGuideItem;
}

export interface RelatedKeyword {
  term: string;
  reason: string;
}

export interface CompanyInsight extends MatchedCompany {
  currency: string | null;
  currentPrice: number | null;
  changeRate: number | null;
  chartPoints: PricePoint[];
  news: NewsHeadline[];
  marketNote: string | null;
  riskGuide: RiskGuide;
}

export interface SearchResultPayload {
  query: string;
  summary: string;
  themes: Theme[];
  companies: CompanyInsight[];
  suggestions: string[];
  relatedKeywords: RelatedKeyword[];
  isDemo: boolean;
}
