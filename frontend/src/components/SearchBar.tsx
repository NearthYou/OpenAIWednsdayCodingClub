interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <section className="panel search-panel">
      <div className="search-panel__header">
        <p className="section-eyebrow">자연어 검색</p>
        <span className="section-helper">키워드 포함 검색으로 빠르게 필터링됩니다.</span>
      </div>
      <label className="search-input-wrap" htmlFor="event-search">
        <span className="search-input-wrap__icon">검색</span>
        <input
          id="event-search"
          className="search-input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="이번 주 블루아카 행사 뭐 있어?"
        />
      </label>
    </section>
  );
}
