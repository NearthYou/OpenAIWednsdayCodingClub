import { CATEGORY_LABELS } from "../constants/filter-options";
import { buildCalendarWeeks, formatMonthLabel, getEventDateKey, isToday } from "../utils/date";
import type { EventItem } from "../types/event";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface MonthCalendarProps {
  month: Date;
  events: EventItem[];
  selectedDate: string;
  isLoading: boolean;
  onMonthChange: (offset: number) => void;
  onDateSelect: (dateKey: string) => void;
}

export function MonthCalendar({
  month,
  events,
  selectedDate,
  isLoading,
  onMonthChange,
  onDateSelect
}: MonthCalendarProps) {
  const weeks = buildCalendarWeeks(month);

  return (
    <section className="panel calendar-panel">
      <div className="calendar-panel__header">
        <div>
          <p className="section-eyebrow">월간 캘린더</p>
          <h2 className="section-title">{formatMonthLabel(month)}</h2>
        </div>
        <div className="month-nav">
          <button className="month-nav__button" type="button" onClick={() => onMonthChange(-1)}>
            이전
          </button>
          <button className="month-nav__button" type="button" onClick={() => onMonthChange(1)}>
            다음
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="calendar-weekdays__label">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-body">
        {weeks.flat().map((day) => {
          const dayEvents = events.filter((event) => getEventDateKey(event) === day.dateKey);
          const previewEvents = dayEvents.slice(0, 2);
          const isSelected = selectedDate === day.dateKey;

          return (
            <button
              key={day.dateKey}
              className={[
                "calendar-day",
                day.isCurrentMonth ? "" : "is-outside",
                isSelected ? "is-selected" : "",
                isToday(day.dateKey) ? "is-today" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              onClick={() => day.isCurrentMonth && onDateSelect(day.dateKey)}
              disabled={!day.isCurrentMonth}
            >
              <div className="calendar-day__top">
                <span className="calendar-day__number">{day.dayNumber}</span>
                {dayEvents.length > 0 ? (
                  <span className="calendar-day__count">{dayEvents.length}개</span>
                ) : null}
              </div>

              <div className="calendar-day__events">
                {previewEvents.map((event) => (
                  <span
                    key={event.id}
                    className={`calendar-mini-chip calendar-mini-chip--${event.sourceType}`}
                    title={event.title}
                  >
                    {CATEGORY_LABELS[event.category]}
                  </span>
                ))}
                {dayEvents.length > 2 ? (
                  <span className="calendar-mini-chip calendar-mini-chip--more">
                    +{dayEvents.length - 2}
                  </span>
                ) : null}
                {!dayEvents.length && day.isCurrentMonth && !isLoading ? (
                  <span className="calendar-day__empty">일정 없음</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
