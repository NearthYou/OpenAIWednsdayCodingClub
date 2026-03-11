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
    tags: ["컴백", "티저", "공식"]
  },
  {
    id: "event-bluearchive-cafe-2026-03-07",
    title: "블루아카 콜라보 카페 오픈",
    entityName: "블루아카",
    category: "anime_game",
    startAt: "2026-03-07T11:00:00+09:00",
    endAt: "2026-03-07T21:00:00+09:00",
    sourceUrl: "https://example.com/bluearchive-cafe",
    sourceName: "블루아카 공식",
    sourceType: "official",
    isOfficial: true,
    tags: ["카페", "콜라보", "행사"]
  },
  {
    id: "event-genshin-broadcast-2026-03-11",
    title: "원신 5.x 업데이트 방송",
    entityName: "원신",
    category: "anime_game",
    startAt: "2026-03-11T20:00:00+09:00",
    endAt: "2026-03-11T21:30:00+09:00",
    sourceUrl: "https://example.com/genshin-update-stream",
    sourceName: "Genshin Impact KR",
    sourceType: "official",
    isOfficial: true,
    tags: ["업데이트", "방송", "공식"]
  },
  {
    id: "event-miku-goods-2026-03-14",
    title: "하츠네 미쿠 봄 굿즈 발매",
    entityName: "하츠네 미쿠",
    category: "goods_release",
    startAt: "2026-03-14T10:00:00+09:00",
    endAt: "2026-03-14T23:59:00+09:00",
    sourceUrl: "https://example.com/miku-spring-goods",
    sourceName: "Good Smile Online",
    sourceType: "official",
    isOfficial: true,
    tags: ["굿즈", "발매", "예약"]
  },
  {
    id: "event-klee-birthday-2026-03-16",
    title: "원신 캐릭터 생일 일러스트 공개",
    entityName: "원신",
    category: "birthday",
    startAt: "2026-03-16T12:00:00+09:00",
    endAt: "2026-03-16T23:59:00+09:00",
    sourceUrl: "https://example.com/genshin-birthday-klee",
    sourceName: "Genshin Impact KR",
    sourceType: "official",
    isOfficial: true,
    tags: ["생일", "일러스트", "캐릭터"]
  },
  {
    id: "event-ive-fan-screening-2026-03-20",
    title: "아이브 팬 주최 상영회",
    entityName: "아이브",
    category: "fan_event",
    startAt: "2026-03-20T18:30:00+09:00",
    endAt: "2026-03-20T21:00:00+09:00",
    sourceUrl: "https://example.com/ive-fan-screening",
    sourceName: "IVE Fan Union",
    sourceType: "community",
    isOfficial: false,
    tags: ["팬이벤트", "상영회", "비공식"]
  },
  {
    id: "event-miku-rumor-2026-03-24",
    title: "미쿠 심포니 추가 공연 루머",
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
    id: "event-infinite-tour-2026-05-24",
    title: "인피니트 서울 앙코르 콘서트",
    entityName: "인피니트",
    category: "artist",
    startAt: "2026-05-24T18:00:00+09:00",
    endAt: "2026-05-24T21:00:00+09:00",
    sourceUrl: "https://example.com/infinite-encore-seoul",
    sourceName: "INFINITE Official",
    sourceType: "official",
    isOfficial: true,
    tags: ["콘서트", "앙코르", "서울"]
  },
  {
    id: "event-vixx-live-2026-04-15",
    title: "빅스 데뷔 기념 라이브 공개",
    entityName: "빅스",
    category: "artist",
    startAt: "2026-04-15T20:00:00+09:00",
    endAt: "2026-04-15T21:00:00+09:00",
    sourceUrl: "https://example.com/vixx-anniversary-live",
    sourceName: "VIXX Official",
    sourceType: "official",
    isOfficial: true,
    tags: ["라이브", "기념", "공식"]
  },
  {
    id: "event-infinite-fancafe-2026-06-08",
    title: "인피니트 데뷔 기념 팬카페 이벤트",
    entityName: "인피니트",
    category: "fan_event",
    startAt: "2026-06-08T12:00:00+09:00",
    endAt: "2026-06-08T18:00:00+09:00",
    sourceUrl: "https://example.com/infinite-fan-cafe-event",
    sourceName: "INFINITE Fan Union",
    sourceType: "community",
    isOfficial: false,
    tags: ["팬카페", "이벤트", "데뷔기념"]
  },
  {
    id: "event-vixx-lightstick-rumor-2026-07-09",
    title: "빅스 응원봉 리뉴얼 루머",
    entityName: "빅스",
    category: "goods_release",
    startAt: "2026-07-09T15:00:00+09:00",
    endAt: "2026-07-09T16:00:00+09:00",
    sourceUrl: "https://example.com/vixx-lightstick-rumor",
    sourceName: "팬 커뮤니티 제보",
    sourceType: "rumor",
    isOfficial: false,
    tags: ["루머", "응원봉", "굿즈"]
  }
];

module.exports = {
  mockEvents
};
