import type { EventCategory, SourceType } from "../types/event";

export const CATEGORY_OPTIONS: Array<{ value: EventCategory; label: string }> = [
  { value: "artist", label: "연예인" },
  { value: "anime_game", label: "애니 / 게임" },
  { value: "goods_release", label: "굿즈" },
  { value: "birthday", label: "생일" },
  { value: "fan_event", label: "팬 이벤트" }
];

export const SOURCE_TYPE_OPTIONS: Array<{ value: SourceType; label: string }> = [
  { value: "official", label: "공식" },
  { value: "community", label: "비공식" },
  { value: "rumor", label: "루머" }
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  artist: "연예인",
  anime_game: "애니 / 게임",
  goods_release: "굿즈",
  birthday: "생일",
  fan_event: "팬 이벤트"
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  official: "공식",
  community: "비공식",
  rumor: "루머"
};
