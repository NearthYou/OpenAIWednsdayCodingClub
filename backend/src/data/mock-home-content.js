function createRelativeIso(dayOffset, hour, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
}

function createSearchUrl(query) {
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}

const trendingKeywords = [
  { keywordId: "keyword-bluearchive", label: "블루 아카이브", searchCount: 18420, momentum: "+18%" },
  { keywordId: "keyword-ive", label: "아이브", searchCount: 15980, momentum: "+12%" },
  { keywordId: "keyword-genshin", label: "원신", searchCount: 14740, momentum: "+9%" },
  { keywordId: "keyword-miku", label: "하츠네 미쿠", searchCount: 11160, momentum: "+14%" },
  { keywordId: "keyword-bluearchive", label: "아비도스 굿즈", searchCount: 8240, momentum: "+21%" }
];

const discoveryItems = [
  {
    id: "discover-bluearchive-stage-briefing",
    keywordId: "keyword-bluearchive",
    keywordLabel: "블루 아카이브",
    kind: "article",
    title: "블루 아카이브 오프라인 행사 요약 기사",
    summary: "이번 주 오프라인 행사 핵심 공지와 현장 포인트를 한 번에 확인할 수 있는 기사입니다.",
    publishedAt: createRelativeIso(-1, 10, 30),
    sourceName: "Naver News",
    sourceUrl: createSearchUrl("블루 아카이브 오프라인 행사 기사")
  },
  {
    id: "discover-bluearchive-cafe-deadline",
    keywordId: "keyword-bluearchive",
    keywordLabel: "블루 아카이브",
    kind: "deadline",
    title: "블루 아카이브 콜라보 카페 예약 마감",
    summary: "예약 잔여 좌석이 빠르게 줄고 있어 확인이 필요한 항목입니다.",
    closingAt: createRelativeIso(3, 23, 59),
    sourceName: "Naver Search",
    sourceUrl: createSearchUrl("블루 아카이브 콜라보 카페 예약")
  },
  {
    id: "discover-ive-stage-outfit",
    keywordId: "keyword-ive",
    keywordLabel: "아이브",
    kind: "article",
    title: "IVE 컴백 무드와 무대 의상 정리",
    summary: "컴백 티저와 함께 공개된 스타일링 포인트를 정리한 기사입니다.",
    publishedAt: createRelativeIso(0, 8, 45),
    sourceName: "Google News",
    sourceUrl: "https://news.google.com/search?q=IVE%20comeback"
  },
  {
    id: "discover-ive-ticket-deadline",
    keywordId: "keyword-ive",
    keywordLabel: "IVE",
    kind: "deadline",
    title: "IVE 팬클럽 선예매 인증 마감",
    summary: "티켓팅 전에 인증을 끝내야 해서 D-day 카드와 함께 확인하면 좋은 항목입니다.",
    closingAt: createRelativeIso(5, 18, 0),
    sourceName: "Naver Search",
    sourceUrl: createSearchUrl("IVE 팬클럽 선예매 인증")
  },
  {
    id: "discover-genshin-update-summary",
    keywordId: "keyword-genshin",
    keywordLabel: "원신",
    kind: "article",
    title: "원신 업데이트 방송 핵심 정리",
    summary: "오늘 공개되는 방송에서 쿠폰, 신규 캐릭터, 이벤트 일정이 어떻게 나오는지 미리 정리했습니다.",
    publishedAt: createRelativeIso(0, 11, 20),
    sourceName: "YouTube Search",
    sourceUrl: "https://www.youtube.com/results?search_query=%EC%9B%90%EC%8B%A0+%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8+%EB%B0%A9%EC%86%A1"
  },
  {
    id: "discover-genshin-web-event",
    keywordId: "keyword-genshin",
    keywordLabel: "원신",
    kind: "deadline",
    title: "원신 웹이벤트 보상 수령 마감",
    summary: "웹 이벤트 참여 후 보상 수령 기한이 임박한 항목입니다.",
    closingAt: createRelativeIso(2, 12, 0),
    sourceName: "Naver Search",
    sourceUrl: createSearchUrl("원신 웹이벤트 보상 수령")
  },
  {
    id: "discover-miku-goods-watch",
    keywordId: "keyword-miku",
    keywordLabel: "하츠네 미쿠",
    kind: "article",
    title: "하츠네 미쿠 봄 시즌 굿즈 체크리스트",
    summary: "이번 시즌 굿즈 구성과 예약 일정, 품절 속도가 빠른 품목을 정리했습니다.",
    publishedAt: createRelativeIso(-2, 16, 10),
    sourceName: "Naver Blog Search",
    sourceUrl: createSearchUrl("하츠네 미쿠 봄 굿즈")
  },
  {
    id: "discover-miku-goods-deadline",
    keywordId: "keyword-miku",
    keywordLabel: "하츠네 미쿠",
    kind: "deadline",
    title: "하츠네 미쿠 한정 굿즈 예약 마감",
    summary: "수량 한정 예약이어서 마감 임박 카드에서 우선 확인할 수 있도록 노출합니다.",
    closingAt: createRelativeIso(6, 23, 0),
    sourceName: "Google Search",
    sourceUrl: "https://www.google.com/search?q=%ED%95%98%EC%B8%A0%EB%84%A4+%EB%AF%B8%EC%BF%A0+%ED%95%9C%EC%A0%95+%EA%B5%BF%EC%A6%88"
  }
];

module.exports = {
  discoveryItems,
  trendingKeywords
};
