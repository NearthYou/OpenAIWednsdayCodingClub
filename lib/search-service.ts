import { themes } from "@/data/companies";
import { buildRelatedKeywords, buildSummary, resolveMatches } from "@/lib/keyword-engine";
import { getNewsHeadlines, getPriceSnapshot } from "@/lib/market-data";
import { buildRiskGuide } from "@/lib/risk-guide";
import { SearchResultPayload } from "@/lib/types";

const exampleSuggestions = ["AI", "반도체", "전기차 배터리", "로봇", "원전", "클라우드", "엔비디아", "삼성전자"];

export const buildSearchResult = async (rawQuery: string | null | undefined): Promise<SearchResultPayload> => {
  const query = rawQuery?.trim() || "AI";
  const isDemo = !rawQuery?.trim();
  const { matchedThemes, companies } = resolveMatches(query);

  const companyInsights = await Promise.all(
    companies.map(async (company) => {
      const [priceSnapshot, news] = await Promise.all([getPriceSnapshot(company.ticker), getNewsHeadlines(company, query)]);
      return {
        ...company,
        ...priceSnapshot,
        news,
        riskGuide: buildRiskGuide(company, priceSnapshot.chartPoints, priceSnapshot.changeRate, news),
      };
    }),
  );

  return {
    query,
    summary: buildSummary(query, matchedThemes, companies),
    themes: matchedThemes.length ? matchedThemes : themes.filter((theme) => theme.id === "ai"),
    companies: companyInsights,
    suggestions: exampleSuggestions,
    relatedKeywords: buildRelatedKeywords(query, matchedThemes, companies),
    isDemo,
  };
};
