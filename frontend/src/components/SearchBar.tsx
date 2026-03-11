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
  helperText = "키워드 포함 검색으로 빠르게 필터링됩니다.",
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
        <span className="search-input-wrap__icon">{iconLabel}</span>
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
