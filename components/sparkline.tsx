import { PricePoint } from "@/lib/types";

interface SparklineProps {
  points: PricePoint[];
}

export function Sparkline({ points }: SparklineProps) {
  if (points.length < 2) {
    return <div className="sparkline-empty">시세 흐름 데이터 없음</div>;
  }

  const closes = points.map((point) => point.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const width = 240;
  const height = 84;
  const range = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.close - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const trendUp = closes.at(-1)! >= closes[0];

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 주가 흐름">
      <polyline fill="none" points={path} stroke={trendUp ? "#1f8f56" : "#c62828"} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
