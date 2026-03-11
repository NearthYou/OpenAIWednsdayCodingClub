import type { EventCategory, EventItem, InterestKeyword, SourceType } from "../types/event";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface FetchEventsParams {
  month: string;
  search?: string;
  categories?: EventCategory[];
  sourceTypes?: SourceType[];
  keywords?: string[];
}

function buildEventsQuery(params: FetchEventsParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("month", params.month);

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.categories?.length) {
    searchParams.set("category", params.categories.join(","));
  }

  if (params.sourceTypes?.length) {
    searchParams.set("sourceType", params.sourceTypes.join(","));
  }

  if (params.keywords?.length) {
    searchParams.set("keyword", params.keywords.join(","));
  }

  return searchParams.toString();
}

export async function fetchEvents(params: FetchEventsParams): Promise<EventItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/events?${buildEventsQuery(params)}`);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const payload = (await response.json()) as { events: EventItem[] };
  return payload.events;
}

export async function fetchEventDetail(id: string): Promise<EventItem> {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch event detail");
  }

  const payload = (await response.json()) as { event: EventItem };
  return payload.event;
}

export async function fetchKeywords(): Promise<InterestKeyword[]> {
  const response = await fetch(`${API_BASE_URL}/api/keywords`);

  if (!response.ok) {
    throw new Error("Failed to fetch keywords");
  }

  const payload = (await response.json()) as { keywords: InterestKeyword[] };
  return payload.keywords;
}
