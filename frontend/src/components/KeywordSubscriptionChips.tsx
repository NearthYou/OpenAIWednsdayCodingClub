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
  const visibleKeywordCount = selectedKeywords.length || keywords.length;
  const previewKeywords = keywords.slice(0, 8);

  return (
    <section className="panel keyword-panel keyword-panel--compact">
      <div className="keyword-panel__header">
        <div>
          <p className="section-eyebrow">관심 키워드</p>
          <h2 className="section-title">보고 싶은 키워드만 켜두기</h2>
          <p className="section-helper keyword-panel__count">{visibleKeywordCount}개 표시 중</p>
        </div>
        <button className="text-button" type="button" onClick={onReset}>
          전체 보기
        </button>
      </div>
      <div className="keyword-chip-list keyword-chip-list--compact">
        {previewKeywords.map((keyword) => {
          const isSelected = !selectedKeywords.length || selectedKeywords.includes(keyword.label);
          return (
            <button
              key={keyword.id}
              className={`keyword-chip${isSelected ? " is-selected" : ""}`}
              type="button"
              onClick={() => onToggle(keyword.label)}
            >
              <span>{keyword.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
