import { type FormEvent, useEffect, useState } from "react";
import { fetchHomeDashboard, searchHomeFeed } from "../api/client";
import type { AuthUser } from "../types/auth";
import type { HomeDashboardPayload, HomeSearchResponse, HomeSearchResultKind } from "../types/home";
import { formatEventTimeRange, formatShortDateLabel, formatShortDateTime } from "../utils/date";

interface HomeDashboardPageProps {
  currentUser: AuthUser;
  sessionToken: string;
  onNavigateToCalendar: () => void;
}

const RESULT_KIND_LABELS: Record<HomeSearchResultKind, string> = {
  article: "Article",
  schedule: "Schedule",
  deadline: "Deadline"
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
          setErrorMessage(error instanceof Error ? error.message : "Failed to load dashboard.");
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
      setSearchErrorMessage(error instanceof Error ? error.message : "Search failed.");
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
          <p className="hero-eyebrow">Main home</p>
          <h1 className="hero-title">{currentUser.displayName}, your fandom command center.</h1>
          <p className="hero-description">
            Search the web snapshot, watch your D-day items, and jump into calendar detail from one
            route. This page owns only the home domain, so merge boundaries stay clear.
          </p>
          <div className="home-hero__actions">
            <button className="auth-submit-button" type="button" onClick={onNavigateToCalendar}>
              Open detailed calendar
            </button>
          </div>
        </div>

        <div className="home-hero__stats">
          <div className="hero-stat-card">
            <span>Subscriptions</span>
            <strong>{dashboard?.subscribedKeywords.length ?? 0}</strong>
          </div>
          <div className="hero-stat-card">
            <span>This week</span>
            <strong>{dashboard?.weekSchedules.length ?? 0} items</strong>
          </div>
          <div className="hero-stat-card">
            <span>Next highlight</span>
            <strong>{dashboard?.nextHighlight || "No upcoming item"}</strong>
          </div>
        </div>
      </section>

      <section className="panel search-composer">
        <div className="search-panel__header">
          <div>
            <p className="section-eyebrow">Search</p>
            <h2 className="section-title">Find related articles and schedules</h2>
          </div>
          <span className="section-helper">Search opens curated web-style results for your fandom keywords.</span>
        </div>

        <form className="search-composer__form" onSubmit={handleSearchSubmit}>
          <label className="search-input-wrap" htmlFor="dashboard-search">
            <span className="search-input-wrap__icon">Search</span>
            <input
              id="dashboard-search"
              className="search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search a fandom keyword, article, or deadline"
            />
          </label>
          <button className="auth-submit-button search-composer__submit" type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

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
              <p className="section-eyebrow">Search results</p>
              <h2 className="section-title">
                {searchResult.query ? `Results for "${searchResult.query}"` : "Suggested results"}
              </h2>
            </div>
            <span className="section-helper">{searchResult.results.length} cards</span>
          </div>

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
                  <span>{result.referenceAt ? formatShortDateTime(result.referenceAt) : "No date"}</span>
                  <a href={result.sourceUrl} target="_blank" rel="noreferrer">
                    {result.sourceName}
                  </a>
                </div>
              </article>
            ))}
          </div>

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
        <div className="panel dashboard-loading">Loading your home dashboard...</div>
      ) : null}

      {!isLoading && dashboard ? (
        <>
          <section className="dashboard-grid">
            <article className="panel dashboard-section">
              <div className="dashboard-section__header">
                <div>
                  <p className="section-eyebrow">D-day</p>
                  <h2 className="section-title">Upcoming subscription moments</h2>
                </div>
                <span className="section-helper">{dashboard.dDayItems.length} upcoming</span>
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
                  <p className="section-eyebrow">Closing soon</p>
                  <h2 className="section-title">Items about to close</h2>
                </div>
                <span className="section-helper">{dashboard.closingSoonItems.length} items</span>
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
                  <p className="section-eyebrow">Today</p>
                  <h2 className="section-title">Today's schedule</h2>
                </div>
                <span className="section-helper">Hidden automatically when there is no item</span>
              </div>

              <div className="schedule-list">
                {dashboard.todaySchedules.map((schedule) => (
                  <article key={schedule.id} className="schedule-card">
                    <div className="event-card__meta">
                      <span className={`status-badge status-badge--${schedule.sourceType}`}>
                        {schedule.sourceType}
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
                <p className="section-eyebrow">This week</p>
                <h2 className="section-title">Weekly schedule bridge</h2>
              </div>
              <span className="section-helper">{dashboard.weekSchedules.length} items</span>
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
