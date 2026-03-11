import { RotateCcw, ShieldCheck, SlidersHorizontal, Tags } from "lucide-react";
import { CATEGORY_OPTIONS, SOURCE_TYPE_OPTIONS } from "../constants/filter-options";
import type { EventCategory, SourceType } from "../types/event";

interface FilterPanelProps {
  selectedCategories: EventCategory[];
  selectedSourceTypes: SourceType[];
  filteredCount: number;
  totalCount: number;
  onToggleCategory: (category: EventCategory) => void;
  onToggleSourceType: (sourceType: SourceType) => void;
  onReset: () => void;
}

export function FilterPanel({
  selectedCategories,
  selectedSourceTypes,
  filteredCount,
  totalCount,
  onToggleCategory,
  onToggleSourceType,
  onReset
}: FilterPanelProps) {
  const isViewingAllCategories = !selectedCategories.length;
  const isViewingAllSourceTypes = !selectedSourceTypes.length;

  return (
    <aside className="panel filter-panel">
      <div className="filter-panel__top">
        <div>
          <p className="section-eyebrow filter-heading">
            <SlidersHorizontal size={15} strokeWidth={2.1} aria-hidden="true" />
            <span>필터</span>
          </p>
          <h2 className="section-title">조건 조합</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>
          <RotateCcw size={15} strokeWidth={2.1} aria-hidden="true" />
          <span>전체 보기</span>
        </button>
      </div>

      <div className="filter-summary">
        <strong>{filteredCount}개</strong>
        <span>현재 표시 중 / 전체 {totalCount}개</span>
      </div>

      <div className="filter-group">
        <h3 className="filter-group__title filter-group__title--with-icon">
          <Tags size={15} strokeWidth={2.1} aria-hidden="true" />
          <span>카테고리</span>
        </h3>
        <div className="filter-option-list">
          {CATEGORY_OPTIONS.map((option) => {
            const isActive = isViewingAllCategories || selectedCategories.includes(option.value);
            return (
              <button
                key={option.value}
                className={`filter-option${isActive ? " is-active" : ""}`}
                type="button"
                onClick={() => onToggleCategory(option.value)}
              >
                <span>{option.label}</span>
                <span>{isActive ? "ON" : "OFF"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group__title filter-group__title--with-icon">
          <ShieldCheck size={15} strokeWidth={2.1} aria-hidden="true" />
          <span>출처 유형</span>
        </h3>
        <div className="filter-option-list">
          {SOURCE_TYPE_OPTIONS.map((option) => {
            const isActive = isViewingAllSourceTypes || selectedSourceTypes.includes(option.value);
            return (
              <button
                key={option.value}
                className={`filter-option filter-option--source${isActive ? " is-active" : ""}`}
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
