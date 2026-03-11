import { useMemo, useState } from "react";
import keywordAespaImage from "../assets/keyword-aespa.jpg";
import keywordInfiniteImage from "../assets/keyword-infinite.jpg";
import keywordIveImage from "../assets/keyword-ive.jpg";
import keywordLesserafimImage from "../assets/keyword-lesserafim.jpg";
import keywordVixxImage from "../assets/keyword-vixx.jpg";
import type { HomeKeywordOption } from "../types/home";
import { getKeywordImage } from "../utils/keyword-images";

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
