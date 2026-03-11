"use client";

import { startTransition, useEffect, useState } from "react";
import {
  MARKET_SCOPE_OPTIONS,
  getToneText,
  type MarketBrief,
  type MarketScope,
  type Tone
} from "@/lib/market-brief";
import { MarketIndexCharts } from "@/components/market-index-charts";

type MarketRadarAppProps = {
  initialBrief: MarketBrief;
};

function formatTime(dateText: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateText));
}

function formatAge(dateText: string) {
  const diffMs = Date.now() - new Date(dateText).getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.round(diffHours / 24)}일 전`;
}

function toneAccentLabel(tone: Tone) {
  if (tone === "bullish") {
    return "위험 선호";
  }

  if (tone === "bearish") {
    return "경계 우세";
  }

  return "혼조 흐름";
}

export function MarketRadarApp({ initialBrief }: MarketRadarAppProps) {
  const [scope, setScope] = useState<MarketScope>(initialBrief.scope);
  const [brief, setBrief] = useState<MarketBrief>(initialBrief);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBrief(targetScope: MarketScope) {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/market-brief?scope=${targetScope}&t=${Date.now()}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const nextBrief = (await response.json()) as MarketBrief;

        if (!cancelled) {
          setBrief(nextBrief);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("실시간 뉴스 요청이 실패해 현재 데이터 기준으로 표시하고 있습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBrief(scope);

    return () => {
      cancelled = true;
    };
  }, [scope]);

  async function refresh() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/market-brief?scope=${scope}&t=${Date.now()}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      setBrief((await response.json()) as MarketBrief);
      setError(null);
    } catch {
      setError("새로고침에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsLoading(false);
    }
  }

  const totalToneCount = brief.bullishCount + brief.bearishCount + brief.neutralCount;
  const bullishShare =
    totalToneCount === 0 ? 0 : Math.round((brief.bullishCount / totalToneCount) * 100);
  const bearishShare =
    totalToneCount === 0 ? 0 : Math.round((brief.bearishCount / totalToneCount) * 100);
  const neutralShare = Math.max(0, 100 - bullishShare - bearishShare);
  const topKeywords = brief.keywordSignals.slice(0, 3);

  const metrics = [
    {
      label: "분석 뉴스",
      value: `${brief.headlineCount}건`,
      detail: `${brief.feedCount}개 RSS 피드`
    },
    {
      label: "대표 뉴스",
      value: `${brief.representativeCount}개`,
      detail: "중복 주제 제거"
    },
    {
      label: "출처 수",
      value: `${brief.sourceCount}곳`,
      detail: "헤드라인 기준"
    },
    {
      label: "시장 시그널",
      value: toneAccentLabel(brief.strongestTone),
      detail: `${getToneText(brief.strongestTone)} 우세`
    }
  ];

  return (
    <main className="app-shell">
      <section className="hero-board rise-in">
        <div className="hero-copy-zone">
          <div className="hero-topline">
            <p className="eyebrow">Signal-driven market digest</p>
            <span className={brief.mode === "live" ? "status live" : "status demo"}>
              {brief.mode === "live" ? "실시간 RSS" : "데모 데이터"}
            </span>
          </div>
          <h1>Market Pulse Radar</h1>
          <p className="hero-copy">
            많은 뉴스를 한 번에 가져온 뒤 키워드 분포와 시장 톤을 계산하고, 그중
            대표성이 높은 뉴스 4개만 골라 보여주는 주식 뉴스 대시보드입니다.
          </p>
          <div className="signal-strip">
            {brief.signalLine.map((item) => (
              <span key={item} className="signal-pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-signal-board">
          <div className={`hero-tone-card tone-${brief.strongestTone}`}>
            <span>시장 톤</span>
            <strong>{getToneText(brief.strongestTone)}</strong>
            <p>{brief.overview}</p>
          </div>

          <div className="pulse-card">
            <div className="pulse-head">
              <span>뉴스 분포</span>
              <strong>{toneAccentLabel(brief.strongestTone)}</strong>
            </div>
            <div className="sentiment-bar" aria-hidden="true">
              <span className="sentiment-positive" style={{ width: `${bullishShare}%` }} />
              <span className="sentiment-neutral" style={{ width: `${neutralShare}%` }} />
              <span className="sentiment-negative" style={{ width: `${bearishShare}%` }} />
            </div>
            <div className="sentiment-legend">
              <span>긍정 {bullishShare}%</span>
              <span>중립 {neutralShare}%</span>
              <span>부정 {bearishShare}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="toolbar rise-in">
        <div className="scope-row">
          {MARKET_SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={option.value === scope ? "scope-button active" : "scope-button"}
              type="button"
              onClick={() =>
                startTransition(() => {
                  setScope(option.value);
                })
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="toolbar-right">
          <span className="timestamp">{formatTime(brief.generatedAt)} 기준</span>
          <button className="refresh-button" type="button" onClick={() => void refresh()}>
            {isLoading ? "분석 중..." : "새로고침"}
          </button>
        </div>
      </section>

      <section className="keyword-banner rise-in">
        <div className="keyword-banner-head">
          <div>
            <p className="panel-kicker">Representative Keywords</p>
            <h2>오늘의 대표 키워드</h2>
          </div>
          <p className="panel-note">많이 수집한 기사들에서 가장 자주 등장한 키워드만 먼저 보여줍니다.</p>
        </div>

        <div className="keyword-banner-grid">
          {topKeywords.map((keyword, index) => (
            <article key={keyword.label} className={`keyword-chip-card tone-${keyword.tone}`}>
              <span className="keyword-rank">0{index + 1}</span>
              <strong>{keyword.label}</strong>
              <p>
                {keyword.share}% 기사에서 등장, {keyword.count}건 포착
              </p>
              <span className={`tone-badge tone-${keyword.tone}`}>{getToneText(keyword.tone)}</span>
            </article>
          ))}
        </div>
      </section>

      <MarketIndexCharts />

      <section className="summary-grid rise-in">
        {metrics.map((metric) => (
          <article key={metric.label} className="summary-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="analysis-grid">
        <section className="panel rise-in">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">{brief.label}</p>
              <h2>주식 동향 키워드 맵</h2>
            </div>
            <span className="panel-note">{brief.description}</span>
          </div>

          <div className="keyword-stack">
            {brief.keywordSignals.map((signal) => (
              <article key={signal.label} className={`keyword-row tone-${signal.tone}`}>
                <div className="keyword-main">
                  <div>
                    <span className="keyword-label">{signal.label}</span>
                    <strong>{signal.count}건</strong>
                  </div>
                  <span className={`tone-badge tone-${signal.tone}`}>{getToneText(signal.tone)}</span>
                </div>
                <div className="keyword-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(signal.share, 8)}%` }} />
                </div>
                <p>{signal.share}%의 기사에서 함께 등장한 핵심 키워드입니다.</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel insight-panel rise-in">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Selection Logic</p>
              <h2>대표 뉴스 선정 방식</h2>
            </div>
          </div>

          <ol className="insight-list">
            <li>먼저 여러 RSS 피드에서 뉴스들을 대량으로 수집합니다.</li>
            <li>전체 기사에서 키워드와 톤 분포를 먼저 계산합니다.</li>
            <li>상위 키워드별로 가장 관련성이 높은 기사만 대표 뉴스로 남깁니다.</li>
          </ol>

          <div className="insight-box">
            <span>현재 해석</span>
            <strong>{toneAccentLabel(brief.strongestTone)}</strong>
            <p>{brief.overview}</p>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </aside>
      </section>

      <section className="panel rise-in">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Representative stories</p>
            <h2>분석 후 추려낸 대표 뉴스 4개</h2>
          </div>
        </div>

        <div className="spotlight-grid">
          {brief.topNews.map((item, index) => (
            <article key={item.id} className={`spotlight-card tone-${item.tone}`}>
              <div className="spotlight-head">
                <span className="story-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="story-meta">
                  <span>{item.source}</span>
                  <span>{formatAge(item.publishedAt)}</span>
                  <span className={`tone-badge tone-${item.tone}`}>{getToneText(item.tone)}</span>
                </div>
              </div>
              <h3>{item.title}</h3>
              <p className="story-note">{item.note}</p>
              <p className="story-reason">{item.reason}</p>
              <div className="tag-row">
                {item.keywords.map((keyword) => (
                  <span key={`${item.id}-${keyword}`} className="tag">
                    {keyword}
                  </span>
                ))}
              </div>
              <a href={item.link} target="_blank" rel="noreferrer">
                기사 보기
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
