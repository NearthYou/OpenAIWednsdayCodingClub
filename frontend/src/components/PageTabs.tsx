import "../styles/page-tabs.css";

export type AppView = "calendar" | "goods";

interface PageTabsProps {
  currentView: AppView;
}

const tabs: Array<{ view: AppView; label: string; description: string; hash: string }> = [
  {
    view: "calendar",
    label: "메인 캘린더",
    description: "와이어프레임 2",
    hash: "#calendar"
  },
  {
    view: "goods",
    label: "굿즈 탐색",
    description: "탐색 페이지",
    hash: "#goods-explore"
  }
];

export function PageTabs({ currentView }: PageTabsProps) {
  return (
    <nav className="panel page-tabs" aria-label="페이지 전환">
      <div>
        <p className="section-eyebrow">page map</p>
        <h2 className="section-title">현재 구조 유지 + 굿즈 탐색 추가</h2>
      </div>
      <div className="page-tabs__list">
        {tabs.map((tab) => (
          <a
            key={tab.view}
            className={`page-tabs__link${tab.view === currentView ? " is-active" : ""}`}
            href={tab.hash}
          >
            <span>{tab.label}</span>
            <small>{tab.description}</small>
          </a>
        ))}
      </div>
    </nav>
  );
}
