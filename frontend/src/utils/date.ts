import type { EventItem } from "../types/event";

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

export function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultSelectedDate(monthDate: Date) {
  const today = new Date();
  if (getMonthKey(today) === getMonthKey(monthDate)) {
    return getDateKey(today);
  }

  return `${getMonthKey(monthDate)}-01`;
}

export function getEventDateKey(event: EventItem) {
  return event.startAt.slice(0, 10);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(date);
}

export function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function formatEventTimeRange(startAt: string, endAt?: string) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;

  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(start);

  const timeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(start);

  if (!endAt || !end) {
    return `${dateLabel} ${timeLabel}`;
  }

  const endTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(end);

  return `${dateLabel} ${timeLabel} - ${endTimeLabel}`;
}

export function formatCompactEventTimeRange(startAt: string, endAt?: string) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;

  const dateLabel = `${start.getMonth() + 1}/${start.getDate()}`;
  const timeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(start);

  if (!endAt || !end) {
    return `${dateLabel} ${timeLabel}`;
  }

  const endTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(end);

  return `${dateLabel} ${timeLabel}-${endTimeLabel}`;
}

export function buildCalendarWeeks(monthDate: Date) {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDay = new Date(firstDayOfMonth);
  firstGridDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const currentDate = new Date(firstGridDay);
    currentDate.setDate(firstGridDay.getDate() + index);

    days.push({
      dateKey: getDateKey(currentDate),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === monthDate.getMonth()
    });
  }

  const weeks: CalendarDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

export function isToday(dateKey: string) {
  return getDateKey(new Date()) === dateKey;
}
