export type IndexHistoryPoint = {
  date: string;
  close: number;
};

export type IndexSeries = {
  id: "nasdaq" | "kospi";
  label: string;
  description: string;
  sourceUrl: string;
  points: IndexHistoryPoint[];
  current: number;
  previous: number;
  change: number;
  changePct: number;
};

const indexConfigs = {
  nasdaq: {
    id: "nasdaq",
    label: "나스닥 종합",
    description: "미국 기술주 중심 전체 지수 흐름",
    symbol: "^ndq",
    sourceUrl: "https://stooq.com/q/?s=%5Endq"
  },
  kospi: {
    id: "kospi",
    label: "코스피",
    description: "국내 대표 종합 지수 흐름",
    symbol: "^kospi",
    sourceUrl: "https://stooq.com/q/?s=%5Ekospi"
  }
} satisfies Record<string, Omit<IndexSeries, "points" | "current" | "previous" | "change" | "changePct"> & { symbol: string }>;

function parseCsv(text: string): IndexHistoryPoint[] {
  const lines = text.trim().split("\n").slice(1);

  return lines
    .map((line) => line.split(","))
    .map((parts) => ({
      date: parts[0] ?? "",
      close: Number(parts[4] ?? 0)
    }))
    .filter((point) => point.date && Number.isFinite(point.close) && point.close > 0);
}

async function fetchSeries(key: keyof typeof indexConfigs): Promise<IndexSeries> {
  const config = indexConfigs[key];
  const response = await fetch(
    `https://stooq.com/q/d/l/?s=${encodeURIComponent(config.symbol)}&i=d`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      next: {
        revalidate: 3600
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Index fetch failed: ${response.status}`);
  }

  const csv = await response.text();
  const allPoints = parseCsv(csv);
  const points = allPoints.slice(-30);
  const current = points.at(-1)?.close ?? 0;
  const previous = points.at(-2)?.close ?? current;
  const change = Number((current - previous).toFixed(2));
  const changePct = previous === 0 ? 0 : Number((((current - previous) / previous) * 100).toFixed(2));

  return {
    id: config.id,
    label: config.label,
    description: config.description,
    sourceUrl: config.sourceUrl,
    points,
    current,
    previous,
    change,
    changePct
  };
}

export async function getIndexSeries() {
  const [nasdaq, kospi] = await Promise.all([fetchSeries("nasdaq"), fetchSeries("kospi")]);

  return {
    nasdaq,
    kospi
  };
}
