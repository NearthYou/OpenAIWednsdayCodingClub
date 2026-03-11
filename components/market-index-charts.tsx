"use client";

import { memo, useEffect, useState } from "react";
import type { IndexSeries } from "@/lib/index-history";

type IndexResponse = {
  nasdaq: IndexSeries;
  kospi: IndexSeries;
};

function formatValue(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatShortDate(dateText: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric"
  }).format(new Date(dateText));
}

function buildPath(points: IndexSeries["points"], width: number, height: number) {
  if (points.length === 0) {
    return "";
  }

  const values = points.map((point) => point.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.close - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(points: IndexSeries["points"], width: number, height: number) {
  const line = buildPath(points, width, height);

  if (!line) {
    return "";
  }

  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function IndexChartCard({ series }: { series: IndexSeries }) {
  const width = 560;
  const height = 240;
  const linePath = buildPath(series.points, width, height);
  const areaPath = buildAreaPath(series.points, width, height);
  const isPositive = series.change >= 0;
  const firstDate = series.points[0]?.date ?? "";
  const lastDate = series.points.at(-1)?.date ?? "";

  return (
    <article className="index-chart-card">
      <div className="index-chart-head">
        <div>
          <p className="panel-kicker">Market Index</p>
          <h3>{series.label}</h3>
        </div>
        <p className="index-chart-copy">{series.description}</p>
      </div>

      <div className="index-chart-summary">
        <div>
          <span className="index-stat-label">현재 지수</span>
          <strong>{formatValue(series.current)}</strong>
        </div>
        <div className={isPositive ? "index-change positive" : "index-change negative"}>
          <span className="index-stat-label">전일 대비</span>
          <strong>
            {isPositive ? "+" : ""}
            {formatValue(series.change)} ({isPositive ? "+" : ""}
            {series.changePct}%)
          </strong>
        </div>
      </div>

      <div className="index-chart-svg-shell">
        <svg className="index-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${series.id}-gradient`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor={isPositive ? "rgba(29, 139, 111, 0.28)" : "rgba(218, 117, 93, 0.24)"}
              />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${series.id}-gradient)`} />
          <path
            d={linePath}
            fill="none"
            stroke={isPositive ? "#1d8b6f" : "#b94a38"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="index-chart-footer">
        <span>{firstDate ? formatShortDate(firstDate) : "-"}</span>
        <span>{lastDate ? formatShortDate(lastDate) : "-"}</span>
      </div>

      <a className="index-source-link" href={series.sourceUrl} target="_blank" rel="noreferrer">
        원본 데이터 보기
      </a>
    </article>
  );
}

export const MarketIndexCharts = memo(function MarketIndexCharts() {
  const [data, setData] = useState<IndexResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/index-history?t=${Date.now()}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Failed");
        }

        const payload = (await response.json()) as IndexResponse;

        if (!cancelled) {
          setData(payload);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <section className="index-chart-grid rise-in">
        <article className="index-chart-card loading-card">지수 그래프 불러오는 중...</article>
        <article className="index-chart-card loading-card">지수 그래프 불러오는 중...</article>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="index-chart-grid rise-in">
        <article className="index-chart-card loading-card">지수 그래프를 불러오지 못했습니다.</article>
      </section>
    );
  }

  return (
    <section className="index-chart-grid rise-in">
      <IndexChartCard series={data.nasdaq} />
      <IndexChartCard series={data.kospi} />
    </section>
  );
});
