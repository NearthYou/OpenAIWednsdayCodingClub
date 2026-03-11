import { companies, themes } from "@/data/companies";
import { Company, MatchedCompany, RelatedKeyword, Theme, ThemeId } from "@/lib/types";

const tokenize = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

const includesAny = (target: string, aliases: string[]) =>
  aliases.some((alias) => target.includes(alias.toLowerCase()) || alias.toLowerCase().includes(target));

const scoreTheme = (query: string, theme: Theme) => {
  const normalized = query.toLowerCase();
  let score = 0;

  for (const alias of theme.aliases) {
    const aliasValue = alias.toLowerCase();
    if (normalized === aliasValue) {
      score += 8;
      continue;
    }

    if (normalized.includes(aliasValue) || aliasValue.includes(normalized)) {
      score += 5;
    }
  }

  return score;
};

const scoreCompany = (query: string, company: Company, matchedThemes: Theme[]) => {
  const normalized = query.toLowerCase();
  const tokens = tokenize(query);
  let score = 0;

  for (const alias of company.aliases) {
    const aliasValue = alias.toLowerCase();
    if (normalized === aliasValue) {
      score += 12;
      continue;
    }

    if (normalized.includes(aliasValue) || aliasValue.includes(normalized)) {
      score += 8;
    }
  }

  if (company.ticker.toLowerCase() === normalized) {
    score += 12;
  }

  if (tokens.some((token) => company.description.toLowerCase().includes(token))) {
    score += 2;
  }

  for (const theme of matchedThemes) {
    if (company.themes.includes(theme.id)) {
      score += 6;
    }
  }

  return score;
};

const buildRelationship = (company: Company, matchedThemes: Theme[]) => {
  for (const theme of matchedThemes) {
    const reason = company.reasons[theme.id];
    if (reason) {
      return reason;
    }
  }

  const firstTheme = themes.find((theme) => company.themes.includes(theme.id));
  return firstTheme ? company.reasons[firstTheme.id] ?? company.description : company.description;
};

export const resolveMatches = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return {
      matchedThemes: [] as Theme[],
      companies: [] as MatchedCompany[],
    };
  }

  const matchedThemes = themes
    .map((theme) => ({ theme, score: scoreTheme(normalizedQuery, theme) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ theme }) => theme);

  const inferredThemes = matchedThemes.length
    ? matchedThemes
    : themes.filter((theme) => includesAny(normalizedQuery, theme.aliases));

  const companiesWithScore = companies
    .map((company) => {
      const directScore = scoreCompany(normalizedQuery, company, inferredThemes);
      const themeMatches = inferredThemes.filter((theme) => company.themes.includes(theme.id));
      const fallbackThemeMatches = matchedThemes.length
        ? themeMatches
        : themes.filter((theme) => company.themes.includes(theme.id) && includesAny(normalizedQuery, theme.aliases));
      const matchedThemeIds = (fallbackThemeMatches.length ? fallbackThemeMatches : themeMatches).map(
        (theme) => theme.id,
      );

      return {
        ...company,
        score: directScore,
        matchedThemes: matchedThemeIds,
        relationship: buildRelationship(company, fallbackThemeMatches.length ? fallbackThemeMatches : themeMatches),
      } satisfies MatchedCompany;
    })
    .filter((company) => company.score > 0)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, 8);

  return {
    matchedThemes: inferredThemes,
    companies: companiesWithScore,
  };
};

export const buildSummary = (query: string, matchedThemes: Theme[], matchedCompanies: MatchedCompany[]) => {
  if (!matchedCompanies.length) {
    return `"${query}"와 직접 연결된 종목을 찾지 못했다. AI, 반도체, 전기차 배터리, 로봇, 원전, 클라우드처럼 산업 키워드나 회사명/티커로 다시 검색해보면 좋다.`;
  }

  const themeLabels = matchedThemes.slice(0, 3).map((theme) => theme.label);
  const representativeCompanies = matchedCompanies
    .slice(0, 3)
    .map((company) => company.name)
    .join(", ");

  if (themeLabels.length) {
    return `"${query}"는 ${themeLabels.join(", ")} 흐름과 가까운 키워드로 해석했다. 상단에는 해당 산업 맥락을, 아래에는 ${representativeCompanies} 같은 관련 상장사를 묶어 보여준다.`;
  }

  return `"${query}"와 직접 맞닿은 상장사 중심으로 결과를 정리했다. 아래 카드에서 기업별 연결 이유, 최근 주가 흐름, 관련 뉴스 헤드라인을 함께 확인할 수 있다.`;
};

export const themeById = (themeId: ThemeId) => themes.find((theme) => theme.id === themeId);

const relatedKeywordMap: Record<ThemeId, RelatedKeyword[]> = {
  ai: [
    { term: "AI 반도체", reason: "모델 학습과 추론 수요가 직접 이어지는 세부 키워드다." },
    { term: "데이터센터", reason: "AI 서비스 확대와 함께 인프라 투자 흐름을 같이 보기 좋다." },
    { term: "생성형 AI", reason: "응용 서비스와 플랫폼 기업을 더 넓게 탐색할 수 있다." },
  ],
  semiconductor: [
    { term: "HBM", reason: "AI 서버향 메모리 수요를 더 구체적으로 볼 수 있다." },
    { term: "파운드리", reason: "칩 설계와 생산 사이 공급망을 나눠서 보기 좋다." },
    { term: "GPU", reason: "고성능 연산 칩 수요와 직접 연결되는 키워드다." },
  ],
  "ev-battery": [
    { term: "양극재", reason: "배터리 소재 업체까지 탐색 범위를 넓힐 수 있다." },
    { term: "리튬", reason: "원재료 가격과 공급망 이슈를 같이 보기 좋다." },
    { term: "완성차", reason: "배터리 수요가 실제 판매와 어떻게 연결되는지 볼 수 있다." },
  ],
  robot: [
    { term: "휴머노이드", reason: "로봇 테마 안에서도 기대감이 큰 세부 영역이다." },
    { term: "산업 자동화", reason: "실제 설비 투자와 연결되는 기업군을 찾기 좋다." },
    { term: "협동로봇", reason: "제조 현장 중심 수요를 더 구체적으로 볼 수 있다." },
  ],
  nuclear: [
    { term: "SMR", reason: "차세대 원전 기대감이 반영되는 세부 키워드다." },
    { term: "우라늄", reason: "연료 가격과 공급 업체 흐름을 같이 볼 수 있다." },
    { term: "전력 인프라", reason: "발전 정책과 유틸리티 기업까지 범위를 넓힐 수 있다." },
  ],
  cloud: [
    { term: "SaaS", reason: "클라우드 위에서 구독형 소프트웨어 기업을 함께 볼 수 있다." },
    { term: "하이퍼스케일러", reason: "대형 인프라 사업자 중심 흐름을 좁혀 볼 수 있다." },
    { term: "클라우드 보안", reason: "인프라 확대와 함께 커지는 인접 수요를 볼 수 있다." },
  ],
};

export const buildRelatedKeywords = (
  query: string,
  matchedThemes: Theme[],
  matchedCompanies: MatchedCompany[],
): RelatedKeyword[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const themeIds = matchedThemes.length
    ? matchedThemes.map((theme) => theme.id)
    : Array.from(new Set(matchedCompanies.flatMap((company) => company.themes))).slice(0, 3);

  const baseKeywords = themeIds.flatMap((themeId) => relatedKeywordMap[themeId] ?? []);
  const companyKeywords = matchedCompanies.slice(0, 2).flatMap((company) =>
    company.themes.slice(0, 2).map((themeId) => ({
      term: `${company.name} ${themeById(themeId)?.label ?? themeId}`,
      reason: `${company.name}를 중심으로 세부 산업 연결성을 다시 탐색할 수 있다.`,
    })),
  );

  const seen = new Set<string>();
  return [...baseKeywords, ...companyKeywords]
    .filter((keyword) => keyword.term.toLowerCase() !== normalizedQuery)
    .filter((keyword) => {
      const key = keyword.term.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 6);
};
