import { type FormEvent, useEffect, useRef, useState } from "react";
import { fetchHomeDashboard, searchHomeFeed } from "../api/client";
import heroFandomScene from "../assets/hero-fandom-scene.svg";
import { HomeKeywordSubscriptionPanel } from "../components/HomeKeywordSubscriptionPanel";
import { SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { EventDetailPage } from "./EventDetailPage";
import type { AuthSessionPayload, AuthUser } from "../types/auth";
import type { SavedScheduleItem } from "../types/event";
import type {
  HomeDashboardPayload,
  HomeDdaySummary,
  HomeScheduleSummary,
  ClosingSoonSummary,
  HomeSearchResponse,
  HomeSearchResult,
  HomeSearchResultKind,
  HomeSearchSourceScope
} from "../types/home";
import { formatEventTimeRange, formatShortDateLabel, formatShortDateTime } from "../utils/date";
import {
  createDetailPageItemFromClosingSoon,
  createDetailPageItemFromHomeDday,
  createDetailPageItemFromHomeSchedule,
  createDetailPageItemFromHomeSearchResult,
  type DetailPageItem
} from "../utils/detail-page-item";

interface HomeDashboardPageProps {
  currentUser: AuthUser;
  sessionToken: string;
  savedSchedules: SavedScheduleItem[];
  onNavigateToCalendar: () => void;
  onSaveSchedule: (schedule: SavedScheduleItem) => void;
  onUpdateSubscriptions: (subscriptionKeywordIds: string[]) => Promise<AuthSessionPayload>;
}

const RESULT_KIND_LABELS: Record<HomeSearchResultKind, string> = {
  article: "기사",
  schedule: "일정",
  deadline: "마감"
};

const SOURCE_SCOPE_LABELS: Record<HomeSearchSourceScope, string> = {
  calendar: "상세 캘린더",
  stored: "사이트 저장",
  web: "웹 최신"
};

const HOME_HERO_QUOTES = [
  {
    lead: "덕질은 계획적으로 시작되지 않는다.",
    body: "어느 날 갑자기 찾아오는 교통사고처럼 시작된다."
  },
  {
    lead: "입덕은 순간이고, 덕질은 생활이 된다.",
    body: "한 번 마음에 들어오면 일상 시간표가 조용히 다시 짜인다."
  },
  {
    lead: "좋아하는 마음은 늘 예고 없이 커진다.",
    body: "그래서 덕질은 준비보다 발견에 더 가깝다."
  },
  {
    lead: "한 장면에 흔들리고 한 문장에 오래 머문다.",
    body: "덕질은 결국 좋아하는 것을 기억하는 방식이다."
  },
  {
    lead: "오늘의 관심이 내일의 일정표를 만든다.",
    body: "좋아하는 사람을 따라가다 보면 계획도 자연스럽게 생긴다."
  }
];

function getRandomQuoteIndex(exceptIndex?: number) {
  if (HOME_HERO_QUOTES.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * HOME_HERO_QUOTES.length);

  while (nextIndex === exceptIndex) {
    nextIndex = Math.floor(Math.random() * HOME_HERO_QUOTES.length);
  }

  return nextIndex;
}

function getSubscribedKeywordIds(dashboard: HomeDashboardPayload | null, currentUser: AuthUser) {
  return dashboard?.subscribedKeywords.map((keyword) => keyword.id) || currentUser.subscriptionKeywordIds;
}

export function HomeDashboardPage({
  currentUser,
  sessionToken,
  savedSchedules,
  onNavigateToCalendar,
  onSaveSchedule,
  onUpdateSubscriptions
}: HomeDashboardPageProps) {
  const [dashboard, setDashboard] = useState<HomeDashboardPayload | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSubscriptions, setIsSavingSubscriptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<HomeSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [hideUnsubscribedSearchKeywords, setHideUnsubscribedSearchKeywords] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState<DetailPageItem | null>(null);
  const [heroQuoteIndex, setHeroQuoteIndex] = useState(() => getRandomQuoteIndex());
  const searchSectionRef = useRef<HTMLElement | null>(null);

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
  }, [dashboardRefreshKey, sessionToken]);

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

  async function handleSubscriptionToggle(keywordId: string) {
    const currentSubscriptionKeywordIds = getSubscribedKeywordIds(dashboard, currentUser);
    const isSubscribed = currentSubscriptionKeywordIds.includes(keywordId);
    const nextSubscriptionKeywordIds = isSubscribed
      ? currentSubscriptionKeywordIds.filter((currentKeywordId) => currentKeywordId !== keywordId)
      : [...currentSubscriptionKeywordIds, keywordId];

    setIsSavingSubscriptions(true);
    setErrorMessage("");

    try {
      await onUpdateSubscriptions(nextSubscriptionKeywordIds);
      setDashboardRefreshKey((currentValue) => currentValue + 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "구독 키워드를 저장하지 못했습니다.");
    } finally {
      setIsSavingSubscriptions(false);
    }
  }

  function openDetailFromSearchResult(result: HomeSearchResult) {
    setSelectedDetailItem(createDetailPageItemFromHomeSearchResult(result));
  }

  function openDetailFromDday(item: HomeDdaySummary) {
    setSelectedDetailItem(createDetailPageItemFromHomeDday(item));
  }

  function openDetailFromClosingSoon(item: ClosingSoonSummary) {
    setSelectedDetailItem(createDetailPageItemFromClosingSoon(item));
  }

  function openDetailFromHomeSchedule(item: HomeScheduleSummary) {
    setSelectedDetailItem(createDetailPageItemFromHomeSchedule(item));
  }

  function renderSearchResultCard(result: HomeSearchResult) {
    return (
      <button
        key={result.id}
        className="search-result-card dashboard-card-button"
        type="button"
        onClick={() => openDetailFromSearchResult(result)}
      >
        <div className="search-result-card__meta">
          <span className={`status-badge status-badge--${result.kind}`}>{RESULT_KIND_LABELS[result.kind]}</span>
          <span className="category-badge">{result.keywordLabel}</span>
          <span className={`source-scope-badge source-scope-badge--${result.sourceScope}`}>
            {SOURCE_SCOPE_LABELS[result.sourceScope]}
          </span>
        </div>
        <h3 className="event-card__title">{result.title}</h3>
        <p className="search-result-card__summary">{result.summary}</p>
        <div className="search-result-card__footer">
          <span>{result.referenceAt ? formatShortDateTime(result.referenceAt) : "날짜 정보 없음"}</span>
          <span>{result.sourceName}</span>
        </div>
      </button>
    );
  }

  if (selectedDetailItem) {
    return (
      <EventDetailPage
        item={selectedDetailItem}
        backLabel="홈 화면으로 돌아가기"
        onBack={() => setSelectedDetailItem(null)}
        savedSchedules={savedSchedules}
        onSaveSchedule={onSaveSchedule}
      />
    );
  }

  const subscribedKeywordIds = getSubscribedKeywordIds(dashboard, currentUser);
  const availableKeywords = dashboard?.availableKeywords || [];
  const visibleTrendingKeywords = (dashboard?.trendingKeywords || []).filter(
    (keyword) => !hideUnsubscribedSearchKeywords || keyword.isSubscribed
  );
  const visibleRelatedKeywords = (searchResult?.relatedKeywords || []).filter(
    (keyword) => !hideUnsubscribedSearchKeywords || keyword.isSubscribed
  );
  const heroQuote = HOME_HERO_QUOTES[heroQuoteIndex];

  return (
    <main className="page-shell home-page">
      <section className="panel home-hero">
        <div className="home-hero__copy">
          <div className="home-hero__quote-stage">
            <div className="home-hero__quote-copy">
              <p className="hero-eyebrow">오늘의 덕질 문장</p>
              <h1 className="hero-title home-hero__quote">{heroQuote.lead}</h1>
              <p className="hero-description home-hero__quote-body">{heroQuote.body}</p>
            </div>

            <div className="home-hero__art-card" aria-hidden="true">
              <img src={heroFandomScene} alt="" className="home-hero__art-image" />
            </div>
          </div>

          <div className="home-hero__actions">
            <button className="auth-submit-button" type="button" onClick={onNavigateToCalendar}>
              상세 캘린더 보기
            </button>
            <button
              className="text-button home-hero__shuffle-button"
              type="button"
              onClick={() => setHeroQuoteIndex((currentIndex) => getRandomQuoteIndex(currentIndex))}
            >
              다른 문장 보기
            </button>
            <button
              className="text-button home-hero__search-button"
              type="button"
              onClick={() => searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              검색 화면으로 이동
            </button>
          </div>
        </div>

        <div className="home-hero__stats">
          <div className="hero-stat-card">
            <span>구독 키워드</span>
            <strong>{subscribedKeywordIds.length}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>오늘 일정</span>
            <strong>{dashboard?.todaySchedules.length ?? 0}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>다음 체크 포인트</span>
            <strong>{dashboard?.nextHighlight || "예정된 항목이 없습니다"}</strong>
          </div>
        </div>
      </section>

      {!isLoading && dashboard ? (
        <HomeKeywordSubscriptionPanel
          keywords={availableKeywords}
          subscribedKeywordIds={subscribedKeywordIds}
          isSaving={isSavingSubscriptions}
          onToggle={handleSubscriptionToggle}
        />
      ) : null}

      <section ref={searchSectionRef} className="panel search-composer">
        <div className="search-panel__header">
          <div>
            <p className="section-eyebrow">검색</p>
            <h2 className="section-title">저장된 일정과 웹 최신 기사 함께 찾기</h2>
          </div>
          <div className="panel-inline-actions">
            <span className="section-helper">
              입력한 키워드 기준으로 우리 사이트 저장 결과와 웹 최신 기사를 함께 보여줍니다.
            </span>
            <button
              className="text-button"
              type="button"
              onClick={() => setHideUnsubscribedSearchKeywords((current) => !current)}
            >
              {hideUnsubscribedSearchKeywords ? "미구독 보기" : "미구독 숨기기"}
            </button>
          </div>
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
          {visibleTrendingKeywords.length ? (
            visibleTrendingKeywords.map((keyword) => (
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
            ))
          ) : (
            <div className="state-box state-box--empty search-keyword-empty">
              현재 구독 중인 키워드만 보이도록 설정되어 있습니다.
            </div>
          )}
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
            <span className="section-helper">
              저장 결과 {searchResult.localResults.length}개 · 웹 최신 {searchResult.webResults.length}개
            </span>
          </div>

          <div className="search-result-group">
            <div className="search-result-group__header">
              <h3>우리 사이트 저장 결과</h3>
              <span>{searchResult.localResults.length}개</span>
            </div>

            {searchResult.localResults.length ? (
              <div className="search-results-grid">{searchResult.localResults.map(renderSearchResultCard)}</div>
            ) : (
              <div className="state-box state-box--empty">저장된 일정과 기사에서 일치하는 결과가 없습니다.</div>
            )}
          </div>

          {searchResult.query ? (
            <div className="search-result-group">
              <div className="search-result-group__header">
                <h3>웹 최신 기사</h3>
                <span>{searchResult.webResults.length}개</span>
              </div>

              {searchResult.webResults.length ? (
                <div className="search-results-grid">{searchResult.webResults.map(renderSearchResultCard)}</div>
              ) : (
                <div className="state-box state-box--empty">웹 최신 기사 검색 결과가 없습니다.</div>
              )}
            </div>
          ) : null}

          {visibleRelatedKeywords.length ? (
            <div className="related-keyword-list">
              {visibleRelatedKeywords.map((keyword) => (
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
          ) : searchResult.relatedKeywords.length && hideUnsubscribedSearchKeywords ? (
            <div className="state-box state-box--empty search-keyword-empty">
              미구독 키워드가 숨겨져 있어 관련 키워드가 표시되지 않습니다.
            </div>
          ) : null}
        </section>
      ) : null}

      {errorMessage ? <div className="notice-banner">{errorMessage}</div> : null}

      {isLoading ? <div className="panel dashboard-loading">홈 대시보드를 불러오는 중입니다...</div> : null}

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

              {dashboard.dDayItems.length ? (
                <div className="countdown-grid">
                  {dashboard.dDayItems.map((item) => (
                    <button
                      key={item.id}
                      className="countdown-card dashboard-card-button"
                      type="button"
                      onClick={() => openDetailFromDday(item)}
                    >
                      <span className="countdown-card__label">{item.ddayLabel}</span>
                      <h3>{item.title}</h3>
                      <p>{item.entityName}</p>
                      <div className="countdown-card__footer">
                        <span>{formatShortDateLabel(item.startAt)}</span>
                        <span>{item.sourceName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="state-box state-box--empty">구독 키워드 기준으로 다가오는 일정이 없습니다.</div>
              )}
            </article>

            <article className="panel dashboard-section">
              <div className="dashboard-section__header">
                <div>
                  <p className="section-eyebrow">곧 마감</p>
                  <h2 className="section-title">마감이 임박한 항목</h2>
                </div>
                <span className="section-helper">상세 캘린더 기반 {dashboard.closingSoonItems.length}개</span>
              </div>

              {dashboard.closingSoonItems.length ? (
                <div className="deadline-list">
                  {dashboard.closingSoonItems.map((item) => (
                    <button
                      key={item.id}
                      className="deadline-card dashboard-card-button"
                      type="button"
                      onClick={() => openDetailFromClosingSoon(item)}
                    >
                      <div>
                        <span className="deadline-card__keyword">{item.keywordLabel}</span>
                        <h3>{item.title}</h3>
                      </div>
                      <p>{item.summary}</p>
                      <div className="deadline-card__footer">
                        <span>{formatShortDateTime(item.closingAt)}</span>
                        <span>{item.sourceName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="state-box state-box--empty">상세 캘린더 기준으로 곧 마감될 항목이 없습니다.</div>
              )}
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
                  <button
                    key={schedule.id}
                    className="schedule-card dashboard-card-button"
                    type="button"
                    onClick={() => openDetailFromHomeSchedule(schedule)}
                  >
                    <div className="event-card__meta">
                      <span className={`status-badge status-badge--${schedule.sourceType}`}>
                        {SOURCE_TYPE_LABELS[schedule.sourceType]}
                      </span>
                    </div>
                    <h3>{schedule.title}</h3>
                    <p>{schedule.entityName}</p>
                    <div className="schedule-card__footer">
                      <span>{formatEventTimeRange(schedule.startAt, schedule.endAt || undefined)}</span>
                      <span>{schedule.sourceName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
