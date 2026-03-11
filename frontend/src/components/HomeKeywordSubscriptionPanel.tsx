import type { HomeKeywordOption } from "../types/home";
import { useMemo, useState } from "react";

interface HomeKeywordSubscriptionPanelProps {
  keywords: HomeKeywordOption[];
  subscribedKeywordIds: string[];
  isSaving: boolean;
  onToggle: (keywordId: string) => void;
}

export function HomeKeywordSubscriptionPanel({
  keywords,
  subscribedKeywordIds,
  isSaving,
  onToggle
}: HomeKeywordSubscriptionPanelProps) {
  const [hideUnsubscribedKeywords, setHideUnsubscribedKeywords] = useState(true);
  const visibleKeywords = useMemo(() => {
    if (!hideUnsubscribedKeywords) {
      return keywords;
    }

    return keywords.filter((keyword) => subscribedKeywordIds.includes(keyword.id));
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
            AI 추천으로 시작된 {subscribedKeywordIds.length}개 구독 {isSaving ? "· 저장 중..." : ""}
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

          return (
            <button
              key={keyword.id}
              className={`home-subscription-chip${isSubscribed ? " is-subscribed" : ""}`}
              type="button"
              disabled={isSaving}
              onClick={() => onToggle(keyword.id)}
            >
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
