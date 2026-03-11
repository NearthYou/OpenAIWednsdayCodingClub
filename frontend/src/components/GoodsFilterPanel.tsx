import { GOODS_RELEASE_OPTIONS } from "../constants/goods-options";
import { SOURCE_TYPE_OPTIONS } from "../constants/filter-options";
import type { SourceType } from "../types/event";
import type { GoodsReleaseType } from "../types/goods";

interface GoodsFilterPanelProps {
  selectedReleaseTypes: GoodsReleaseType[];
  selectedSourceTypes: SourceType[];
  filteredCount: number;
  totalCount: number;
  onToggleReleaseType: (releaseType: GoodsReleaseType) => void;
  onToggleSourceType: (sourceType: SourceType) => void;
  onReset: () => void;
}

export function GoodsFilterPanel({
  selectedReleaseTypes,
  selectedSourceTypes,
  filteredCount,
  totalCount,
  onToggleReleaseType,
  onToggleSourceType,
  onReset
}: GoodsFilterPanelProps) {
  return (
    <aside className="panel filter-panel">
      <div className="filter-panel__top">
        <div>
          <p className="section-eyebrow">굿즈 필터</p>
          <h2 className="section-title">탐색 조건</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>
          초기화
        </button>
      </div>

      <div className="filter-summary">
        <strong>{filteredCount}개</strong>
        <span>현재 표시 중 / 전체 {totalCount}개</span>
      </div>

      <div className="filter-group">
        <h3 className="filter-group__title">판매 방식</h3>
        <div className="filter-option-list">
          {GOODS_RELEASE_OPTIONS.map((option) => {
            const isActive = selectedReleaseTypes.includes(option.value);
            return (
              <button
                key={option.value}
                className={`filter-option${isActive ? " is-active" : ""}`}
                type="button"
                onClick={() => onToggleReleaseType(option.value)}
              >
                <span>{option.label}</span>
                <span>{isActive ? "ON" : "OFF"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group__title">출처 유형</h3>
        <div className="filter-option-list">
          {SOURCE_TYPE_OPTIONS.map((option) => {
            const isActive = selectedSourceTypes.includes(option.value);
            return (
              <button
                key={option.value}
                className={`filter-option${isActive ? " is-active" : ""}`}
                type="button"
                onClick={() => onToggleSourceType(option.value)}
              >
                <span>{option.label}</span>
                <span>{isActive ? "ON" : "OFF"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
