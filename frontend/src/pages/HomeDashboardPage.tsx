import { type FormEvent, useEffect, useState } from "react";
import { fetchHomeDashboard, searchHomeFeed } from "../api/client";
import { SOURCE_TYPE_LABELS } from "../constants/filter-options";
import type { AuthUser } from "../types/auth";
import type { HomeDashboardPayload, HomeSearchResponse, HomeSearchResultKind } from "../types/home";
import { formatEventTimeRange, formatShortDateLabel, formatShortDateTime } from "../utils/date";

interface HomeDashboardPageProps {
  currentUser: AuthUser;
  sessionToken: string;
  onNavigateToCalendar: () => void;
}

const RESULT_KIND_LABELS: Record<HomeSearchResultKind, string> = {
  article: "기사",
  schedule: "일정",
  deadline: "마감"
};

export function HomeDashboardPage({
  currentUser,
  sessionToken,
  onNavigateToCalendar
}: HomeDashboardPageProps) {
  const [dashboard, setDashboard] = useState<HomeDashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<HomeSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextDashboard = await fetchHomeDashboard(sessionToken);

        if (isMounted) {
          setDashboard(nextDashboard);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "홈 대시보드를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  async function runSearch(nextQuery: string) {
    setSearchQuery(nextQuery);
    setIsSearching(true);
    setSearchErrorMessage("");

    try {
      const nextSearchResult = await searchHomeFeed(sessionToken, nextQuery);
      setSearchResult(nextSearchResult);
    } catch (error) {
      setSearchErrorMessage(error instanceof Error ? error.message : "검색 결과를 불러오지 못했습니다.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(searchQuery);
  }

  return (
    <main className="page-shell home-page">
      <section className="panel home-hero">
        <div className="home-hero__copy">
          <p className="hero-eyebrow">메인 홈</p>
          <h1 className="hero-title">{currentUser.displayName}님을 위한 덕질 홈 대시보드</h1>
          <p className="hero-description">
            검색으로 기사와 일정을 빠르게 확인하고, D-day와 캘린더 요약으로 오늘 해야 할 체크를 바로
            파악할 수 있습니다. 홈 도메인만 분리해서 작업하므로 이후 머지할 때도 경계가 분명합니다.
          </p>
          <div className="home-hero__actions">
            <button className="auth-submit-button" type="button" onClick={onNavigateToCalendar}>
              상세 캘린더 보기
            </button>
          </div>
        </div>

        <div className="home-hero__stats">
          <div className="hero-stat-card">
            <span>구독 키워드</span>
            <strong>{dashboard?.subscribedKeywords.length ?? 0}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>이번 주 일정</span>
            <strong>{dashboard?.weekSchedules.length ?? 0}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>다음 체크 포인트</span>
            <strong>{dashboard?.nextHighlight || "예정된 항목이 없습니다"}</strong>
          </div>
        </div>
      </section>

      <section className="panel search-composer">
        <div className="search-panel__header">
          <div>
            <p className="section-eyebrow">검색</p>
            <h2 className="section-title">관련 기사와 일정을 함께 찾기</h2>
          </div>
          <span className="section-helper">구독 중인 키워드를 기준으로 기사, 일정, 마감 항목을 함께 보여줍니다.</span>
        </div>

        <form className="search-composer__form" onSubmit={handleSearchSubmit}>
          <label className="search-input-wrap" htmlFor="dashboard-search">
            <span className="search-input-wrap__icon">검색</span>
            <input
              id="dashboard-search"
              className="search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="키워드, 기사, 일정, 마감 항목을 검색해 보세요"
            />
          </label>
          <button className="auth-submit-button search-composer__submit" type="submit" disabled={isSearching}>
            {isSearching ? "검색 중..." : "검색"}
          </button>
        </form>

        <div className="search-composer__subcopy">
          많이 검색된 키워드를 누르면 바로 관련 결과를 불러옵니다.
        </div>

        <div className="trending-keyword-row">
          {(dashboard?.trendingKeywords || []).map((keyword) => (
            <button
              key={`${keyword.keywordId}-${keyword.label}`}
              className={`trending-keyword-chip${keyword.isSubscribed ? " is-subscribed" : ""}`}
              type="button"
              onClick={() => void runSearch(keyword.label)}
            >
              <span>{keyword.label}</span>
              <small>
                {keyword.searchCount.toLocaleString()} / {keyword.momentum}
              </small>
            </button>
          ))}
        </div>
      </section>

      {searchErrorMessage ? <div className="notice-banner">{searchErrorMessage}</div> : null}

      {searchResult ? (
        <section className="panel dashboard-section search-results-section">
          <div className="dashboard-section__header">
            <div>
              <p className="section-eyebrow">검색 결과</p>
              <h2 className="section-title">
                {searchResult.query ? `"${searchResult.query}" 검색 결과` : "추천 결과"}
              </h2>
            </div>
            <span className="section-helper">{searchResult.results.length}개 카드</span>
          </div>

          {searchResult.results.length ? (
            <div className="search-results-grid">
              {searchResult.results.map((result) => (
                <article key={result.id} className="search-result-card">
                  <div className="search-result-card__meta">
                    <span className={`status-badge status-badge--${result.kind}`}>
                      {RESULT_KIND_LABELS[result.kind]}
                    </span>
                    <span className="category-badge">{result.keywordLabel}</span>
                  </div>
                  <h3 className="event-card__title">{result.title}</h3>
                  <p className="search-result-card__summary">{result.summary}</p>
                  <div className="search-result-card__footer">
                    <span>{result.referenceAt ? formatShortDateTime(result.referenceAt) : "날짜 정보 없음"}</span>
                    <a href={result.sourceUrl} target="_blank" rel="noreferrer">
                      {result.sourceName}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="state-box state-box--empty">
              검색 결과가 없습니다. 다른 키워드로 다시 검색해 보세요.
            </div>
          )}

          {searchResult.relatedKeywords.length ? (
            <div className="related-keyword-list">
              {searchResult.relatedKeywords.map((keyword) => (
                <button
                  key={`related-${keyword.keywordId}-${keyword.label}`}
                  className="text-button"
                  type="button"
                  onClick={() => void runSearch(keyword.label)}
                >
                  {keyword.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {errorMessage ? <div className="notice-banner">{errorMessage}</div> : null}

      {isLoading ? (
        <div className="panel dashboard-loading">홈 대시보드를 불러오는 중입니다...</div>
      ) : null}

      {!isLoading && dashboard ? (
        <>
          <section className="dashboard-grid">
            <article className="panel dashboard-section">
              <div className="dashboard-section__header">
                <div>
                  <p className="section-eyebrow">D-day</p>
                  <h2 className="section-title">다가오는 구독 일정</h2>
                </div>
                <span className="section-helper">{dashboard.dDayItems.length}개 예정</span>
              </div>

              <div className="countdown-grid">
                {dashboard.dDayItems.map((item) => (
                  <article key={item.id} className="countdown-card">
                    <span className="countdown-card__label">{item.ddayLabel}</span>
                    <h3>{item.title}</h3>
                    <p>{item.entityName}</p>
                    <div className="countdown-card__footer">
                      <span>{formatShortDateLabel(item.startAt)}</span>
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                        {item.sourceName}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel dashboard-section">
              <div className="dashboard-section__header">
                <div>
                  <p className="section-eyebrow">곧 마감</p>
                  <h2 className="section-title">마감이 임박한 항목</h2>
                </div>
                <span className="section-helper">{dashboard.closingSoonItems.length}개 항목</span>
              </div>

              <div className="deadline-list">
                {dashboard.closingSoonItems.map((item) => (
                  <article key={item.id} className="deadline-card">
                    <div>
                      <span className="deadline-card__keyword">{item.keywordLabel}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.summary}</p>
                    <div className="deadline-card__footer">
                      <span>{formatShortDateTime(item.closingAt)}</span>
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                        {item.sourceName}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>

          {dashboard.todaySchedules.length ? (
            <section className="panel dashboard-section">
              <div className="dashboard-section__header">
                <div>
                  <p className="section-eyebrow">오늘</p>
                  <h2 className="section-title">오늘의 일정</h2>
                </div>
                <span className="section-helper">일정이 없으면 이 영역은 표시되지 않습니다</span>
              </div>

              <div className="schedule-list">
                {dashboard.todaySchedules.map((schedule) => (
                  <article key={schedule.id} className="schedule-card">
                    <div className="event-card__meta">
                      <span className={`status-badge status-badge--${schedule.sourceType}`}>
                        {SOURCE_TYPE_LABELS[schedule.sourceType]}
                      </span>
                    </div>
                    <h3>{schedule.title}</h3>
                    <p>{schedule.entityName}</p>
                    <div className="schedule-card__footer">
                      <span>{formatEventTimeRange(schedule.startAt, schedule.endAt || undefined)}</span>
                      <a href={schedule.sourceUrl} target="_blank" rel="noreferrer">
                        {schedule.sourceName}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel dashboard-section">
            <div className="dashboard-section__header">
              <div>
                <p className="section-eyebrow">이번 주</p>
                <h2 className="section-title">이번 주 일정 요약</h2>
              </div>
              <span className="section-helper">{dashboard.weekSchedules.length}개 일정</span>
            </div>

            <div className="schedule-list">
              {dashboard.weekSchedules.map((schedule) => (
                <article key={schedule.id} className="schedule-card">
                  <div className="schedule-card__topline">
                    <strong>{schedule.title}</strong>
                    <span>{formatShortDateLabel(schedule.startAt)}</span>
                  </div>
                  <p>{schedule.entityName}</p>
                  <div className="schedule-card__footer">
                    <span>{formatEventTimeRange(schedule.startAt, schedule.endAt || undefined)}</span>
                    <a href={schedule.sourceUrl} target="_blank" rel="noreferrer">
                      {schedule.sourceName}
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="related-keyword-list">
              {dashboard.subscribedKeywords.map((keyword) => (
                <span key={keyword.id} className="keyword-summary-chip">
                  {keyword.label}
                </span>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
