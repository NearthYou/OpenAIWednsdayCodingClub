import type { EventItem, SavedScheduleItem } from "../types/event";
import type { DetailPageItem } from "./detail-page-item";

export const SAVED_SCHEDULE_STORAGE_KEY = "fandom.calendar.saved-schedules";

function isSavedScheduleItem(value: unknown): value is SavedScheduleItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SavedScheduleItem>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.entityName === "string" &&
    typeof candidate.typeLabel === "string" &&
    typeof candidate.dateKey === "string" &&
    typeof candidate.sourceName === "string" &&
    typeof candidate.sourceUrl === "string" &&
    Array.isArray(candidate.tags) &&
    typeof candidate.savedAt === "string"
  );
}

export function readSavedSchedules() {
  try {
    const rawValue = window.localStorage.getItem(SAVED_SCHEDULE_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isSavedScheduleItem).sort(sortSavedSchedules);
  } catch {
    return [];
  }
}

export function persistSavedSchedules(items: SavedScheduleItem[]) {
  window.localStorage.setItem(SAVED_SCHEDULE_STORAGE_KEY, JSON.stringify(items));
}

export function sortSavedSchedules(left: SavedScheduleItem, right: SavedScheduleItem) {
  const leftTime = left.startAt || left.dateKey;
  const rightTime = right.startAt || right.dateKey;

  return leftTime.localeCompare(rightTime) || right.savedAt.localeCompare(left.savedAt);
}

export function getSavedScheduleId(item: DetailPageItem, eventData?: EventItem | null) {
  const sharedEventId = eventData?.id || item.sourceEventId;

  if (sharedEventId) {
    return `event:${sharedEventId}`;
  }

  return `${item.kind}:${item.id}`;
}

export function buildSavedScheduleItem(item: DetailPageItem, eventData?: EventItem | null) {
  const startAt = eventData?.startAt || item.startAt;
  const dateKey = startAt?.slice(0, 10);

  if (!dateKey) {
    return null;
  }

  return {
    id: getSavedScheduleId(item, eventData),
    sourceEventId: eventData?.id || item.sourceEventId,
    title: eventData?.title || item.title,
    entityName: eventData?.entityName || item.entityName,
    typeLabel: item.typeLabel,
    dateKey,
    startAt,
    endAt: eventData?.endAt || item.endAt,
    sourceName: eventData?.sourceName || item.sourceName,
    sourceUrl: eventData?.sourceUrl || item.sourceUrl,
    tags: eventData?.tags.length ? [...eventData.tags] : [...item.tags],
    savedAt: new Date().toISOString()
  } satisfies SavedScheduleItem;
}
