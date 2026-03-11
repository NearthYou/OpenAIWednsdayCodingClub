import { useDeferredValue, useEffect, useState } from "react";
import { fetchEvents, fetchKeywords } from "../api/client";
import { EventList } from "../components/EventList";
import { FilterPanel } from "../components/FilterPanel";
import { KeywordSubscriptionChips } from "../components/KeywordSubscriptionChips";
import { MonthCalendar } from "../components/MonthCalendar";
import { SearchBar } from "../components/SearchBar";
import { CATEGORY_OPTIONS, SOURCE_TYPE_OPTIONS } from "../constants/filter-options";
import { fallbackEvents, fallbackKeywords } from "../data/fallback-data";
import { EventDetailPage } from "./EventDetailPage";
import type {
  EventCategory,
  EventItem,
  InterestKeyword,
  SavedScheduleItem,
  SourceType
} from "../types/event";
import { getDefaultSelectedDate, getEventDateKey, getMonthKey } from "../utils/date";
import { createDetailPageItemFromEvent } from "../utils/detail-page-item";
import { filterEvents } from "../utils/event-filters";

interface CalendarPageProps {
  savedSchedules: SavedScheduleItem[];
  onSaveSchedule: (schedule: SavedScheduleItem) => void;
}

function getInitialMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function toggleArrayItem<T>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function toggleImplicitAllSelection<T>(items: T[], value: T, allValues: T[]) {
  if (!items.length) {
    return allValues.filter((item) => item !== value);
  }

  const nextItems = toggleArrayItem(items, value);
  return nextItems.length === allValues.length ? [] : nextItems;
}

function getFallbackEventsByMonth(monthKey: string) {
  return fallbackEvents.filter((event) => event.startAt.slice(0, 7) === monthKey);
}

export function CalendarPage({ savedSchedules, onSaveSchedule }: CalendarPageProps) {
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
  const [noticeMessage, setNoticeMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
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
      } catch {
        if (!isMounted) {
          return;
        }

        setFetchedEvents(getFallbackEventsByMonth(monthKey));
        setNoticeMessage("API 연결이 불안정해 mock 데이터로 계속 보여주고 있습니다.");
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

  useEffect(() => {
    if (!filteredEvents.length) {
      return;
    }

    const hasVisibleEventOnSelectedDate = filteredEvents.some(
      (event) => getEventDateKey(event) === selectedDate
    );

    if (!hasVisibleEventOnSelectedDate) {
      setSelectedDate(getEventDateKey(filteredEvents[0]));
    }
  }, [filteredEvents, selectedDate]);

  const selectedDateEvents = filteredEvents.filter(
    (event) => getEventDateKey(event) === selectedDate
  );

  if (selectedEvent) {
    return (
      <EventDetailPage
        item={createDetailPageItemFromEvent(selectedEvent)}
        backLabel="캘린더로 돌아가기"
        onBack={() => setSelectedEvent(null)}
        savedSchedules={savedSchedules}
        onSaveSchedule={onSaveSchedule}
      />
    );
  }

  function handleMonthChange(offset: number) {
    setMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  function handleCategoryToggle(category: EventCategory) {
    setSelectedCategories((current) =>
      toggleImplicitAllSelection(
        current,
        category,
        CATEGORY_OPTIONS.map((option) => option.value)
      )
    );
  }

  function handleSourceTypeToggle(sourceType: SourceType) {
    setSelectedSourceTypes((current) =>
      toggleImplicitAllSelection(
        current,
        sourceType,
        SOURCE_TYPE_OPTIONS.map((option) => option.value)
      )
    );
  }

  function handleKeywordToggle(keyword: string) {
    setSelectedInterestKeywords((current) =>
      toggleImplicitAllSelection(
        current,
        keyword,
        interestKeywords.map((interestKeyword) => interestKeyword.label)
      )
    );
  }

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedSourceTypes([]);
    setSelectedInterestKeywords([]);
  }

  return (
    <main className="page-shell calendar-page-shell">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="section-eyebrow">캘린더</p>
          <h1 className="hero-title">관심 일정만 골라 보는 팬 캘린더</h1>
          <p className="hero-description">검색과 필터를 먼저 고르고, 날짜를 눌러 필요한 일정만 확인하세요.</p>
        </div>
      </section>

      <section className="top-control-grid top-control-grid--single">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </section>

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
          savedDateKeys={savedSchedules.map((schedule) => schedule.dateKey)}
          isLoading={isLoading}
          onMonthChange={handleMonthChange}
          onDateSelect={setSelectedDate}
        />

        <EventList
          selectedDate={selectedDate}
          events={selectedDateEvents}
          isLoading={isLoading}
          onEventSelect={setSelectedEvent}
        />
      </section>
    </main>
  );
}
