import { useDeferredValue, useEffect, useState } from "react";
import { fetchEvents, fetchKeywords } from "../api/client";
import { EventList } from "../components/EventList";
import { FilterPanel } from "../components/FilterPanel";
import { KeywordSubscriptionChips } from "../components/KeywordSubscriptionChips";
import { MonthCalendar } from "../components/MonthCalendar";
import { SearchBar } from "../components/SearchBar";
import { fallbackEvents, fallbackKeywords } from "../data/fallback-data";
import type { EventCategory, EventItem, InterestKeyword, SourceType } from "../types/event";
import { getDefaultSelectedDate, getEventDateKey, getMonthKey, formatMonthLabel } from "../utils/date";
import { filterEvents } from "../utils/event-filters";

function getInitialMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function toggleArrayItem<T>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function getFallbackEventsByMonth(monthKey: string) {
  return fallbackEvents.filter((event) => event.startAt.slice(0, 7) === monthKey);
}

export function CalendarPage() {
  const [month, setMonth] = useState<Date>(() => getInitialMonth());
  const [selectedDate, setSelectedDate] = useState<string>(() => getDefaultSelectedDate(getInitialMonth()));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<SourceType[]>([]);
  const [selectedInterestKeywords, setSelectedInterestKeywords] = useState<string[]>([]);
  const [fetchedEvents, setFetchedEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [interestKeywords, setInterestKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const monthKey = getMonthKey(month);

  useEffect(() => {
    let isMounted = true;

    async function loadKeywords() {
      try {
        const keywords = await fetchKeywords();
        if (isMounted) {
          setInterestKeywords(keywords);
        }
      } catch {
        if (isMounted) {
          setInterestKeywords(fallbackKeywords);
        }
      }
    }

    void loadKeywords();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setIsLoading(true);
      setNoticeMessage("");

      try {
        const events = await fetchEvents({ month: monthKey });
        if (!isMounted) {
          return;
        }

        setFetchedEvents(events);
        setIsUsingFallback(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setFetchedEvents(getFallbackEventsByMonth(monthKey));
        setIsUsingFallback(true);
        setNoticeMessage("API 연결에 실패해 mock 데이터로 계속 진행 중입니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [monthKey]);

  useEffect(() => {
    setFilteredEvents(
      filterEvents(fetchedEvents, {
        searchQuery: deferredSearchQuery,
        selectedCategories,
        selectedSourceTypes,
        selectedInterestKeywords
      })
    );
  }, [
    deferredSearchQuery,
    fetchedEvents,
    selectedCategories,
    selectedInterestKeywords,
    selectedSourceTypes
  ]);

  useEffect(() => {
    if (selectedDate.slice(0, 7) !== monthKey) {
      setSelectedDate(getDefaultSelectedDate(month));
    }
  }, [month, monthKey, selectedDate]);

  const selectedDateEvents = filteredEvents.filter(
    (event) => getEventDateKey(event) === selectedDate
  );

  function handleMonthChange(offset: number) {
    setMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  function handleCategoryToggle(category: EventCategory) {
    setSelectedCategories((current) => toggleArrayItem(current, category));
  }

  function handleSourceTypeToggle(sourceType: SourceType) {
    setSelectedSourceTypes((current) => toggleArrayItem(current, sourceType));
  }

  function handleKeywordToggle(keyword: string) {
    setSelectedInterestKeywords((current) => toggleArrayItem(current, keyword));
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedSourceTypes([]);
    setSelectedInterestKeywords([]);
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="hero-eyebrow">덕후 일정 통합 플랫폼 MVP</p>
          <h1 className="hero-title">공식 일정부터 팬 이벤트까지 한 화면에서 보는 일정 캘린더</h1>
          <p className="hero-description">
            관심 키워드, 검색어, 출처 유형을 조합해서 월간 일정과 선택 날짜 리스트를 동시에 확인할 수 있습니다.
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <span>현재 월</span>
            <strong>{formatMonthLabel(month)}</strong>
          </div>
          <div className="hero-stat-card">
            <span>표시 일정</span>
            <strong>{filteredEvents.length}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>데이터 모드</span>
            <strong>{isUsingFallback ? "Mock Fallback" : "API Live"}</strong>
          </div>
        </div>
      </section>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <KeywordSubscriptionChips
        keywords={interestKeywords}
        selectedKeywords={selectedInterestKeywords}
        onToggle={handleKeywordToggle}
        onReset={() => setSelectedInterestKeywords([])}
      />

      {noticeMessage ? <div className="notice-banner">{noticeMessage}</div> : null}

      <section className="calendar-layout">
        <FilterPanel
          selectedCategories={selectedCategories}
          selectedSourceTypes={selectedSourceTypes}
          filteredCount={filteredEvents.length}
          totalCount={fetchedEvents.length}
          onToggleCategory={handleCategoryToggle}
          onToggleSourceType={handleSourceTypeToggle}
          onReset={resetFilters}
        />

        <MonthCalendar
          month={month}
          events={filteredEvents}
          selectedDate={selectedDate}
          isLoading={isLoading}
          onMonthChange={handleMonthChange}
          onDateSelect={setSelectedDate}
        />

        <EventList selectedDate={selectedDate} events={selectedDateEvents} isLoading={isLoading} />
      </section>
    </main>
  );
}
