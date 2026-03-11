import { Company, NewsHeadline, PricePoint, RiskGuide, RiskGuideItem, RiskLevel } from "@/lib/types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const average = (values: number[]) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getVolatility = (points: PricePoint[]) => {
  if (points.length < 3) {
    return 0;
  }

  const dailyReturns: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1].close;
    const current = points[index].close;
    if (previous > 0) {
      dailyReturns.push(((current - previous) / previous) * 100);
    }
  }

  const mean = average(dailyReturns);
  const variance = average(dailyReturns.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
};

const toLevel = (score: number): RiskLevel => {
  if (score >= 75) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
};

const buildItem = (score: number, summary: string, factors: string[]): RiskGuideItem => ({
  level: toLevel(score),
  score,
  summary,
  factors,
});

export const buildRiskGuide = (company: Company, chartPoints: PricePoint[], changeRate: number | null, news: NewsHeadline[]): RiskGuide => {
  const volatility = getVolatility(chartPoints);
  const momentum = changeRate ?? 0;
  const buyFactors: string[] = [];
  const sellFactors: string[] = [];

  let buyScore = 30;
  let sellScore = 30;

  if (volatility >= 4) {
    buyScore += 25;
    sellScore += 20;
    buyFactors.push("최근 변동성이 커서 진입 시 가격 출렁임을 크게 겪을 수 있다.");
    sellFactors.push("최근 변동성이 커서 급하게 매도 판단을 내리기 쉬운 구간이다.");
  } else if (volatility >= 2) {
    buyScore += 12;
    sellScore += 10;
    buyFactors.push("단기 변동성이 낮지 않아 분할 접근 여부를 먼저 점검할 필요가 있다.");
    sellFactors.push("단기 변동성 때문에 하루 움직임만 보고 매도하기 쉬운 구간이다.");
  } else {
    buyFactors.push("최근 가격 변동은 상대적으로 안정적인 편이다.");
    sellFactors.push("최근 가격 변동은 상대적으로 안정적인 편이다.");
  }

  if (momentum >= 12) {
    buyScore += 20;
    sellScore += 15;
    buyFactors.push("최근 1개월 상승폭이 커서 추격 매수 위험을 같이 봐야 한다.");
    sellFactors.push("상승 추세가 이어질 경우 너무 이른 매도로 이어질 수 있다.");
  } else if (momentum <= -12) {
    buyScore += 18;
    sellScore += 18;
    buyFactors.push("최근 낙폭이 커서 반등 기대만으로 접근하면 손실 확대 위험이 있다.");
    sellFactors.push("급락 구간의 공포 매도는 이후 반등을 놓칠 위험이 있다.");
  } else if (Math.abs(momentum) >= 5) {
    buyScore += 10;
    sellScore += 8;
    buyFactors.push("최근 추세가 꽤 움직여 진입 타이밍 민감도가 높다.");
    sellFactors.push("최근 추세가 진행 중이라 매도 타이밍 판단이 쉽지 않다.");
  } else {
    buyFactors.push("최근 등락률은 비교적 완만한 편이다.");
    sellFactors.push("최근 등락률은 비교적 완만한 편이다.");
  }

  if (news.length >= 3) {
    buyScore += 8;
    sellScore += 8;
    buyFactors.push("최근 이슈가 많은 종목이라 뉴스 한 건에 따라 분위기가 빠르게 바뀔 수 있다.");
    sellFactors.push("최근 이슈가 많은 종목이라 뉴스에 과민 반응하며 매도할 수 있다.");
  } else {
    buyScore += 4;
    sellScore += 4;
    buyFactors.push("뉴스가 많지 않아 정보 해석이 제한될 수 있다.");
    sellFactors.push("뉴스가 많지 않아 재료 소진 여부를 판단하기 어렵다.");
  }

  if (company.themes.includes("ai") || company.themes.includes("robot") || company.themes.includes("nuclear")) {
    buyScore += 8;
    sellScore += 6;
    buyFactors.push("테마 민감도가 높아 실적 외 기대감이 가격에 크게 반영될 수 있다.");
    sellFactors.push("테마 민감도가 높아 기대감 변화만으로 흔들릴 수 있다.");
  }

  buyScore = clamp(Math.round(buyScore), 0, 100);
  sellScore = clamp(Math.round(sellScore), 0, 100);

  const buySummary =
    buyScore >= 75
      ? "지금 진입하면 변동성, 추세 과열, 뉴스 반응을 함께 감당해야 하는 구간이다."
      : buyScore >= 45
        ? "진입 전 변동성, 최근 추세, 관련 뉴스 강도를 같이 확인하는 편이 좋다."
        : "상대적으로 과열 신호는 약하지만, 진입 판단 전 기본 재료는 다시 확인해야 한다.";

  const sellSummary =
    sellScore >= 75
      ? "지금 매도하면 급한 판단으로 추세나 반등 가능성을 놓칠 위험이 큰 구간이다."
      : sellScore >= 45
        ? "매도 전 최근 추세 지속 여부와 뉴스 재료의 남은 힘을 같이 보는 편이 좋다."
        : "상대적으로 과민 매도 위험은 낮지만, 보유 이유가 약해졌는지는 따로 점검해야 한다.";

  return {
    disclaimer: "이 수치는 투자 권유가 아니라 최근 가격 움직임과 뉴스 강도를 바탕으로 한 교육용 위험 가이드다.",
    buy: buildItem(buyScore, buySummary, buyFactors),
    sell: buildItem(sellScore, sellSummary, sellFactors),
  };
};
