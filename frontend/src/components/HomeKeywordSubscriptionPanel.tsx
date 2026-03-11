import { useMemo, useState } from "react";
import keywordAespaImage from "../assets/keyword-aespa.jpg";
import keywordInfiniteImage from "../assets/keyword-infinite.jpg";
import keywordIveImage from "../assets/keyword-ive.jpg";
import keywordLesserafimImage from "../assets/keyword-lesserafim.jpg";
import keywordVixxImage from "../assets/keyword-vixx.jpg";
import type { HomeKeywordOption } from "../types/home";

const keywordImageMap: Record<string, string> = {
  아이브: keywordIveImage,
  빅스: keywordVixxImage,
  르세라핌: keywordLesserafimImage,
  인피니트: keywordInfiniteImage,
  에스파: keywordAespaImage,
  블루아카:
    "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Blue_Archives_cover.jpeg/330px-Blue_Archives_cover.jpeg",
  원신:
    "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/330px-Genshin_Impact_logo.svg.png",
  "붕괴: 스타레일":
    "https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Honkai_Star_Rail_%28logo%29.png/330px-Honkai_Star_Rail_%28logo%29.png",
  "젠레스 존 제로":
    "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Zenless_Zone_Zero_curved_box_logo.svg/330px-Zenless_Zone_Zero_curved_box_logo.svg.png",
  하츠네미쿠:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Hatsune_miku_logo_v3.svg/330px-Hatsune_miku_logo_v3.svg.png",
  원피스:
    "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg",
  "명탐정 코난":
    "https://upload.wikimedia.org/wikipedia/en/3/3f/Case_Closed_Volume_36.png",
  "귀멸의 칼날":
    "https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg",
  포켓몬:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/330px-International_Pok%C3%A9mon_logo.svg.png"
};

const preferredKeywordOrder = ["아이브", "빅스", "르세라핌", "인피니트", "에스파"];

interface HomeKeywordSubscriptionPanelProps {
  keywords: HomeKeywordOption[];
  subscribedKeywordIds: string[];
  isSaving: boolean;
  onToggle: (keywordId: string) => void;
}

function sortKeywords(keywords: HomeKeywordOption[]) {
  return [...keywords].sort((a, b) => {
    const aIndex = preferredKeywordOrder.indexOf(a.label);
    const bIndex = preferredKeywordOrder.indexOf(b.label);

    if (aIndex === -1 && bIndex === -1) {
      return a.label.localeCompare(b.label, "ko");
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

export function HomeKeywordSubscriptionPanel({
  keywords,
  subscribedKeywordIds,
  isSaving,
  onToggle
}: HomeKeywordSubscriptionPanelProps) {
  const [hideUnsubscribedKeywords, setHideUnsubscribedKeywords] = useState(true);

  const visibleKeywords = useMemo(() => {
    const baseKeywords = hideUnsubscribedKeywords
      ? keywords.filter((keyword) => subscribedKeywordIds.includes(keyword.id))
      : keywords;

    return sortKeywords(baseKeywords);
  }, [hideUnsubscribedKeywords, keywords, subscribedKeywordIds]);

  return (
    <section className="panel dashboard-section home-subscription-panel">
      <div className="dashboard-section__header">
        <div>
          <p className="section-eyebrow">구독 키워드</p>
          <h2 className="section-title">홈에서 바로 구독 관리</h2>
        </div>
        <div className="panel-inline-actions">
          <span className="section-helper">
            {subscribedKeywordIds.length}개 구독 중 {isSaving ? "저장 중..." : ""}
          </span>
          <button
            className="text-button"
            type="button"
            onClick={() => setHideUnsubscribedKeywords((current) => !current)}
          >
            {hideUnsubscribedKeywords ? "미구독 보기" : "미구독 숨기기"}
          </button>
        </div>
      </div>

      <div className="home-subscription-chip-list">
        {visibleKeywords.map((keyword) => {
          const isSubscribed = subscribedKeywordIds.includes(keyword.id);
          const imageUrl = keywordImageMap[keyword.label];

          return (
            <button
              key={keyword.id}
              className={`home-subscription-chip${isSubscribed ? " is-subscribed" : ""}`}
              type="button"
              disabled={isSaving}
              onClick={() => onToggle(keyword.id)}
            >
              <div className="home-subscription-chip__media">
                {imageUrl ? (
                  <img
                    className="home-subscription-chip__image"
                    src={imageUrl}
                    alt={`${keyword.label} 대표 이미지`}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <span>{keyword.label}</span>
              <small>{keyword.group}</small>
              <strong>{isSubscribed ? "구독 중" : "구독 추가"}</strong>
            </button>
          );
        })}
      </div>

      {hideUnsubscribedKeywords && !visibleKeywords.length ? (
        <div className="state-box state-box--empty">현재 구독 중인 키워드가 없습니다.</div>
      ) : null}
    </section>
  );
}
