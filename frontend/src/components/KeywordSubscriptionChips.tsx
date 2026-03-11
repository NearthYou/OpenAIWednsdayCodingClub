import type { InterestKeyword } from "../types/event";

interface KeywordSubscriptionChipsProps {
  keywords: InterestKeyword[];
  selectedKeywords: string[];
  onToggle: (keyword: string) => void;
  onReset: () => void;
}

export function KeywordSubscriptionChips({
  keywords,
  selectedKeywords,
  onToggle,
  onReset
}: KeywordSubscriptionChipsProps) {
  return (
    <section className="panel keyword-panel">
      <div className="keyword-panel__header">
        <div>
          <p className="section-eyebrow">관심 키워드</p>
          <h2 className="section-title">구독 중인 키워드만 골라서 보기</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>
          전체 해제
        </button>
      </div>
      <div className="keyword-chip-list">
        {keywords.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword.label);
          return (
            <button
              key={keyword.id}
              className={`keyword-chip${isSelected ? " is-selected" : ""}`}
              type="button"
              onClick={() => onToggle(keyword.label)}
            >
              <span>{keyword.label}</span>
              <small>{keyword.group}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
