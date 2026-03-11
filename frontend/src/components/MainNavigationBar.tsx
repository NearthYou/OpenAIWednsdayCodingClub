import duckFacePictogram from "../assets/duck-face-pictogram.svg";
import { APP_NAVIGATION_ITEMS, APP_ROUTE_PATHS, type AppRoutePath } from "../constants/app-routes";

interface MainNavigationBarProps {
  currentRoute: AppRoutePath;
  userName: string;
  onNavigate: (path: AppRoutePath) => void;
  onLogout: () => void;
}

export function MainNavigationBar({
  currentRoute,
  userName,
  onNavigate,
  onLogout
}: MainNavigationBarProps) {
  return (
    <header className="app-header page-shell">
      <div className="panel top-nav">
        <button
          className="top-nav__brand"
          type="button"
          onClick={() => onNavigate(APP_ROUTE_PATHS.home)}
        >
          <span className="top-nav__brand-mark">
            <img className="top-nav__brand-icon" src={duckFacePictogram} alt="덕통사고 오리 얼굴 아이콘" />
          </span>
          <span className="top-nav__brand-copy">
            <strong>덕통사고</strong>
            <small>덕질 일정 메인 홈</small>
          </span>
        </button>

        <nav className="top-nav__links" aria-label="주요 메뉴">
          {APP_NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`top-nav__link${currentRoute === item.path ? " is-active" : ""}`}
              type="button"
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="top-nav__actions">
          <div className="top-nav__user">
            <span className="top-nav__user-label">로그인 중</span>
            <strong>{userName}님</strong>
          </div>
          <button className="text-button top-nav__logout" type="button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
