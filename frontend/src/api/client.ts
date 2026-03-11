import type {
  EventAiSummary,
  EventAiSummaryMeta,
  EventCategory,
  EventItem,
  InterestKeyword,
  SourceType
} from "../types/event";
import type { AuthSessionPayload, LoginRequest, SignupRequest } from "../types/auth";
import type { GoodsItem, GoodsReleaseType } from "../types/goods";
import type { HomeDashboardPayload, HomeSearchResponse } from "../types/home";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

interface FetchEventsParams {
  month: string;
  search?: string;
  categories?: EventCategory[];
  sourceTypes?: SourceType[];
  keywords?: string[];
}

interface FetchGoodsParams {
  month: string;
  search?: string;
  releaseTypes?: GoodsReleaseType[];
  sourceTypes?: SourceType[];
  keywords?: string[];
}

function createApiUrl(pathname: string) {
  return `${API_BASE_URL}${pathname}`;
}

async function requestJson<T>(pathname: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(createApiUrl(pathname), options);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed.");
  }

  return payload as T;
}

function createSessionHeaders(sessionToken: string, headers: HeadersInit = {}) {
  return {
    ...headers,
    "x-session-token": sessionToken
  };
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

function buildGoodsQuery(params: FetchGoodsParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("month", params.month);

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.releaseTypes?.length) {
    searchParams.set("releaseType", params.releaseTypes.join(","));
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
  const payload = await requestJson<{ events: EventItem[] }>(`/api/events?${buildEventsQuery(params)}`);
  return payload.events;
}

export async function fetchEventDetail(id: string): Promise<EventItem> {
  const payload = await requestJson<{ event: EventItem }>(`/api/events/${id}`);
  return payload.event;
}

export async function fetchEventSummary(
  id: string
): Promise<{ summary: EventAiSummary; meta: EventAiSummaryMeta }> {
  const payload = await requestJson<{ summary: EventAiSummary; meta: EventAiSummaryMeta }>(
    `/api/events/${id}/summary`
  );
  if (!payload?.summary || !payload.meta) {
    throw new Error("Invalid AI summary response");
  }

  return {
    summary: payload.summary,
    meta: payload.meta
  };
}

export async function fetchGoods(params: FetchGoodsParams): Promise<GoodsItem[]> {
  const payload = await requestJson<{ goods: GoodsItem[] }>(`/api/goods?${buildGoodsQuery(params)}`);
  return payload.goods;
}

export async function fetchKeywords(): Promise<InterestKeyword[]> {
  const payload = await requestJson<{ keywords: InterestKeyword[] }>("/api/keywords");
  return payload.keywords;
}

export async function signupUser(payload: SignupRequest): Promise<AuthSessionPayload> {
  return requestJson<AuthSessionPayload>("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: LoginRequest): Promise<AuthSessionPayload> {
  return requestJson<AuthSessionPayload>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchSession(sessionToken: string): Promise<AuthSessionPayload> {
  return requestJson<AuthSessionPayload>("/api/auth/session", {
    headers: createSessionHeaders(sessionToken)
  });
}

export async function updateUserSubscriptions(
  sessionToken: string,
  subscriptionKeywordIds: string[]
): Promise<AuthSessionPayload> {
  return requestJson<AuthSessionPayload>("/api/auth/subscriptions", {
    method: "PATCH",
    headers: createSessionHeaders(sessionToken, {
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      subscriptionKeywordIds
    })
  });
}

export async function logoutUser(sessionToken: string): Promise<void> {
  const response = await fetch(createApiUrl("/api/auth/logout"), {
    method: "POST",
    headers: createSessionHeaders(sessionToken)
  });

  if (!response.ok) {
    throw new Error("Failed to logout.");
  }
}

export async function fetchHomeDashboard(sessionToken: string): Promise<HomeDashboardPayload> {
  const payload = await requestJson<{ dashboard: HomeDashboardPayload }>("/api/home/dashboard", {
    headers: createSessionHeaders(sessionToken)
  });

  return payload.dashboard;
}

export async function searchHomeFeed(
  sessionToken: string,
  query: string
): Promise<HomeSearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query);

  return requestJson<HomeSearchResponse>(`/api/home/search?${searchParams.toString()}`, {
    headers: createSessionHeaders(sessionToken)
  });
}
