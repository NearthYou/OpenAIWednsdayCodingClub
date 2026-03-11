const mockEvents = [
  {
    id: "event-ive-teaser-2026-03-04",
    title: "아이브 컴백 티저 공개",
    entityName: "아이브",
    category: "artist",
    startAt: "2026-03-04T09:00:00+09:00",
    endAt: "2026-03-04T10:00:00+09:00",
    sourceUrl: "https://example.com/ive-comeback-teaser",
    sourceName: "IVE Official",
    sourceType: "official",
    isOfficial: true,
    tags: ["컴백", "티저", "연예인"]
  },
  {
    id: "event-bluearchive-cafe-2026-03-07",
    title: "블루아카 콜라보 카페 오픈",
    entityName: "블루아카",
    category: "anime_game",
    startAt: "2026-03-07T11:00:00+09:00",
    endAt: "2026-03-07T21:00:00+09:00",
    sourceUrl: "https://example.com/bluearchive-cafe",
    sourceName: "블루 아카이브 공식",
    sourceType: "official",
    isOfficial: true,
    tags: ["콜라보", "카페", "행사"]
  },
  {
    id: "event-genshin-broadcast-2026-03-11",
    title: "원신 5.3 업데이트 방송",
    entityName: "원신",
    category: "anime_game",
    startAt: "2026-03-11T20:00:00+09:00",
    endAt: "2026-03-11T21:30:00+09:00",
    sourceUrl: "https://example.com/genshin-update-stream",
    sourceName: "Genshin Impact KR",
    sourceType: "official",
    isOfficial: true,
    tags: ["업데이트", "방송", "버전 공개"]
  },
  {
    id: "event-miku-goods-2026-03-14",
    title: "하츠네 미쿠 봄 시즌 굿즈 발매",
    entityName: "하츠네 미쿠",
    category: "goods_release",
    startAt: "2026-03-14T10:00:00+09:00",
    endAt: "2026-03-14T23:59:00+09:00",
    sourceUrl: "https://example.com/miku-spring-goods",
    sourceName: "Good Smile Online",
    sourceType: "official",
    isOfficial: true,
    tags: ["굿즈", "예약", "한정판"]
  },
  {
    id: "event-klee-birthday-2026-03-16",
    title: "클레 생일 기념 일러스트 공개",
    entityName: "원신",
    category: "birthday",
    startAt: "2026-03-16T12:00:00+09:00",
    endAt: "2026-03-16T23:59:00+09:00",
    sourceUrl: "https://example.com/genshin-birthday-klee",
    sourceName: "Genshin Impact KR",
    sourceType: "official",
    isOfficial: true,
    tags: ["생일", "캐릭터", "일러스트"]
  },
  {
    id: "event-ive-fan-screening-2026-03-20",
    title: "아이브 팬 주최 응원 상영회",
    entityName: "아이브",
    category: "fan_event",
    startAt: "2026-03-20T18:30:00+09:00",
    endAt: "2026-03-20T21:00:00+09:00",
    sourceUrl: "https://example.com/ive-fan-screening",
    sourceName: "IVE Fan Union",
    sourceType: "community",
    isOfficial: false,
    tags: ["팬이벤트", "응원", "상영회"]
  },
  {
    id: "event-bluearchive-fan-fair-2026-03-22",
    title: "블루아카 팬 교류전",
    entityName: "블루아카",
    category: "fan_event",
    startAt: "2026-03-22T13:00:00+09:00",
    endAt: "2026-03-22T18:00:00+09:00",
    sourceUrl: "https://example.com/bluearchive-fan-fair",
    sourceName: "블루아카 유저 모임",
    sourceType: "community",
    isOfficial: false,
    tags: ["팬이벤트", "교류전", "비공식"]
  },
  {
    id: "event-miku-rumor-2026-03-24",
    title: "하츠네 미쿠 심포니 추가 회차 루머",
    entityName: "하츠네 미쿠",
    category: "anime_game",
    startAt: "2026-03-24T09:00:00+09:00",
    endAt: "2026-03-24T10:00:00+09:00",
    sourceUrl: "https://example.com/miku-symphony-rumor",
    sourceName: "커뮤니티 제보",
    sourceType: "rumor",
    isOfficial: false,
    tags: ["루머", "공연", "추가회차"]
  },
  {
    id: "event-ive-ticket-open-2026-03-26",
    title: "아이브 공식 팬콘 티켓 오픈",
    entityName: "아이브",
    category: "artist",
    startAt: "2026-03-26T20:00:00+09:00",
    endAt: "2026-03-26T21:00:00+09:00",
    sourceUrl: "https://example.com/ive-ticket-open",
    sourceName: "멜론티켓",
    sourceType: "official",
    isOfficial: true,
    tags: ["티켓", "팬콘", "예매"]
  },
  {
    id: "event-bluearchive-goods-preorder-2026-03-29",
    title: "블루아카 OST 굿즈 예약 시작",
    entityName: "블루아카",
    category: "goods_release",
    startAt: "2026-03-29T15:00:00+09:00",
    endAt: "2026-03-29T23:59:00+09:00",
    sourceUrl: "https://example.com/bluearchive-ost-goods",
    sourceName: "Yostar Store",
    sourceType: "official",
    isOfficial: true,
    tags: ["굿즈", "예약", "OST"]
  },
  {
    id: "event-ive-teaser-2026-03-04-dup",
    title: "아이브 컴백 티저 공개",
    entityName: "아이브",
    category: "artist",
    startAt: "2026-03-04T09:00:00+09:00",
    endAt: "2026-03-04T10:00:00+09:00",
    sourceUrl: "https://example.com/ive-comeback-teaser",
    sourceName: "IVE Official",
    sourceType: "official",
    isOfficial: true,
    tags: ["컴백", "티저", "연예인"]
  }
];

module.exports = {
  mockEvents
};
