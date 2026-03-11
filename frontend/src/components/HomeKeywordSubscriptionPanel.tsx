import type { HomeKeywordOption } from "../types/home";

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
  return (
    <section className="panel dashboard-section home-subscription-panel">
      <div className="dashboard-section__header">
        <div>
          <p className="section-eyebrow">구독 키워드</p>
          <h2 className="section-title">홈에서 바로 구독 관리</h2>
        </div>
        <span className="section-helper">
          AI 추천으로 시작된 {subscribedKeywordIds.length}개 구독 {isSaving ? "· 저장 중..." : ""}
        </span>
      </div>

      <div className="home-subscription-chip-list">
        {keywords.map((keyword) => {
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
    </section>
  );
}
