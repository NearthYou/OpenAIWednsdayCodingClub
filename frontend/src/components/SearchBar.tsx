import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  eyebrow?: string;
  helperText?: string;
  placeholder?: string;
  iconLabel?: string;
  inputId?: string;
}

export function SearchBar({
  value,
  onChange,
  eyebrow = "자연어 검색",
  helperText = "키워드와 검색어를 함께 넣어 빠르게 원하는 일정을 찾을 수 있어요.",
  placeholder = "이번 주 블루아카 행사 뭐 있어?",
  iconLabel = "검색",
  inputId = "event-search"
}: SearchBarProps) {
  return (
    <section className="panel search-panel">
      <div className="search-panel__header">
        <p className="section-eyebrow">{eyebrow}</p>
        <span className="section-helper">{helperText}</span>
      </div>
      <label className="search-input-wrap" htmlFor={inputId}>
        <span className="search-input-wrap__icon" aria-hidden="true">
          <Search size={18} strokeWidth={2.2} />
          <span>{iconLabel}</span>
        </span>
        <input
          id={inputId}
          className="search-input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
    </section>
  );
}
