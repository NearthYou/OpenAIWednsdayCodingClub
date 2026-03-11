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
  { keywordId: "keyword-bluearchive", label: "블루아카", searchCount: 18420, momentum: "+18%" },
  { keywordId: "keyword-ive", label: "아이브", searchCount: 15980, momentum: "+12%" },
  { keywordId: "keyword-lesserafim", label: "르세라핌", searchCount: 15240, momentum: "+16%" },
  { keywordId: "keyword-genshin", label: "원신", searchCount: 14740, momentum: "+9%" },
  { keywordId: "keyword-starrail", label: "붕괴: 스타레일", searchCount: 14160, momentum: "+15%" },
  { keywordId: "keyword-aespa", label: "에스파", searchCount: 13680, momentum: "+11%" },
  { keywordId: "keyword-miku", label: "하츠네 미쿠", searchCount: 11160, momentum: "+14%" },
  { keywordId: "keyword-zenless", label: "젠레스 존 제로", searchCount: 10620, momentum: "+19%" },
  { keywordId: "keyword-onepiece", label: "원피스", searchCount: 9640, momentum: "+7%" },
  { keywordId: "keyword-conan", label: "명탐정 코난", searchCount: 9130, momentum: "+10%" },
  { keywordId: "keyword-pokemon", label: "포켓몬", searchCount: 8860, momentum: "+8%" },
  { keywordId: "keyword-demonslayer", label: "귀멸의 칼날", searchCount: 8410, momentum: "+13%" }
];

const discoveryItems = [
  {
    id: "discover-bluearchive-stage-briefing",
    keywordId: "keyword-bluearchive",
    keywordLabel: "블루아카",
    kind: "article",
    title: "블루 아카이브 오프라인 행사 요약 기사",
    summary: "이번 주 오프라인 행사 핵심 공지와 현장 포인트를 한 번에 확인할 수 있는 기사입니다.",
    publishedAt: createRelativeIso(-1, 10, 30),
    sourceName: "Naver News",
    sourceUrl: createSearchUrl("블루 아카이브 오프라인 행사 기사")
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
    id: "discover-lesserafim-showcase-guide",
    keywordId: "keyword-lesserafim",
    keywordLabel: "르세라핌",
    kind: "article",
    title: "르세라핌 컴백 쇼케이스 관전 포인트",
    summary: "티저 이미지와 셋리스트 힌트를 기준으로 첫 공개 포인트를 정리한 기사입니다.",
    publishedAt: createRelativeIso(0, 9, 40),
    sourceName: "Google News",
    sourceUrl: "https://news.google.com/search?q=%EB%A5%B4%EC%84%B8%EB%9D%BC%ED%95%8C%20showcase"
  },
  {
    id: "discover-aespa-pop-up-briefing",
    keywordId: "keyword-aespa",
    keywordLabel: "에스파",
    kind: "article",
    title: "에스파 팝업 스토어 MD 라인업 브리핑",
    summary: "응원봉 커버와 포토카드 세트 중심으로 먼저 체크할 상품을 정리했습니다.",
    publishedAt: createRelativeIso(-1, 14, 20),
    sourceName: "Naver Search",
    sourceUrl: createSearchUrl("에스파 팝업 스토어 굿즈")
  },
  {
    id: "discover-starrail-special-program",
    keywordId: "keyword-starrail",
    keywordLabel: "붕괴: 스타레일",
    kind: "article",
    title: "붕괴: 스타레일 특별 방송 핵심 예고",
    summary: "버전 특별 방송에서 나올 신규 캐릭터와 보상 쿠폰 포인트를 정리했습니다.",
    publishedAt: createRelativeIso(0, 12, 5),
    sourceName: "YouTube Search",
    sourceUrl: "https://www.youtube.com/results?search_query=%EB%B6%95%EA%B4%B4+%EC%8A%A4%ED%83%80%EB%A0%88%EC%9D%BC+%ED%8A%B9%EB%B3%84+%EB%B0%A9%EC%86%A1"
  },
  {
    id: "discover-zenless-collab-cafe-guide",
    keywordId: "keyword-zenless",
    keywordLabel: "젠레스 존 제로",
    kind: "article",
    title: "젠레스 존 제로 콜라보 카페 방문 가이드",
    summary: "현장 수령 굿즈, 예약 팁, 사진 스팟까지 한 번에 모은 정리글입니다.",
    publishedAt: createRelativeIso(-1, 18, 15),
    sourceName: "Naver Blog Search",
    sourceUrl: createSearchUrl("젠레스 존 제로 콜라보 카페")
  },
  {
    id: "discover-onepiece-pop-up-note",
    keywordId: "keyword-onepiece",
    keywordLabel: "원피스",
    kind: "article",
    title: "원피스 팝업 전시와 한정 MD 체크 포인트",
    summary: "루피, 조로, 에그헤드 테마 굿즈 중심으로 품절 예상 품목을 정리했습니다.",
    publishedAt: createRelativeIso(-2, 15, 0),
    sourceName: "Google Search",
    sourceUrl: "https://www.google.com/search?q=%EC%9B%90%ED%94%BC%EC%8A%A4+%ED%8C%9D%EC%97%85+%EA%B5%BF%EC%A6%88"
  },
  {
    id: "discover-conan-movie-guide",
    keywordId: "keyword-conan",
    keywordLabel: "명탐정 코난",
    kind: "article",
    title: "명탐정 코난 극장판 개봉 전 정리",
    summary: "특별전 티켓, 예매 특전, 전시 연계 굿즈까지 함께 볼 수 있도록 묶었습니다.",
    publishedAt: createRelativeIso(0, 8, 55),
    sourceName: "Naver News",
    sourceUrl: createSearchUrl("명탐정 코난 극장판 전시 특전")
  },
  {
    id: "discover-demonslayer-exhibition-preview",
    keywordId: "keyword-demonslayer",
    keywordLabel: "귀멸의 칼날",
    kind: "article",
    title: "귀멸의 칼날 원화전 예매 전 확인할 것",
    summary: "회차별 굿즈 배포와 현장 동선, 사전 예매 체크리스트를 짧게 정리했습니다.",
    publishedAt: createRelativeIso(-1, 11, 35),
    sourceName: "Google News",
    sourceUrl: "https://news.google.com/search?q=%EA%B7%80%EB%A9%B8%EC%9D%98%20%EC%B9%BC%EB%82%A0%20%EC%9B%90%ED%99%94%EC%A0%84"
  },
  {
    id: "discover-pokemon-center-drop",
    keywordId: "keyword-pokemon",
    keywordLabel: "포켓몬",
    kind: "article",
    title: "포켓몬 센터 시즌 한정 굿즈 드롭 정리",
    summary: "피카츄, 이브이 라인 신상품과 매장 구매 한정 혜택을 빠르게 훑을 수 있습니다.",
    publishedAt: createRelativeIso(-2, 13, 10),
    sourceName: "Naver Search",
    sourceUrl: createSearchUrl("포켓몬 센터 시즌 굿즈")
  }
];

module.exports = {
  discoveryItems,
  trendingKeywords
};
