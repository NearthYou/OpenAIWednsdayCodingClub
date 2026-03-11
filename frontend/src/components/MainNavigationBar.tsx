import { CalendarDays, Gift, Home, LogOut, UserRound } from "lucide-react";
import duckFacePictogram from "../assets/duck-face-pictogram.svg";
import { APP_NAVIGATION_ITEMS, APP_ROUTE_PATHS, type AppRoutePath } from "../constants/app-routes";

interface MainNavigationBarProps {
  currentRoute: AppRoutePath;
  userName: string;
  onNavigate: (path: AppRoutePath) => void;
  onLogout: () => void;
}

function getNavigationIcon(path: AppRoutePath) {
  switch (path) {
    case APP_ROUTE_PATHS.home:
      return <Home size={16} strokeWidth={2.1} aria-hidden="true" />;
    case APP_ROUTE_PATHS.calendar:
      return <CalendarDays size={16} strokeWidth={2.1} aria-hidden="true" />;
    case APP_ROUTE_PATHS.pageTwo:
      return <Gift size={16} strokeWidth={2.1} aria-hidden="true" />;
    case APP_ROUTE_PATHS.myPage:
      return <UserRound size={16} strokeWidth={2.1} aria-hidden="true" />;
    default:
      return null;
  }
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
            <img className="top-nav__brand-icon" src={duckFacePictogram} alt="덕통사고 로고" />
          </span>
          <span className="top-nav__brand-copy">
            <strong>덕통사고</strong>
            <small>덕후 일정 메인 허브</small>
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
              <span className="top-nav__link-icon">{getNavigationIcon(item.path)}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="top-nav__actions">
          <div className="top-nav__user">
            <span className="top-nav__user-label">
              <UserRound size={14} strokeWidth={2.1} aria-hidden="true" />
              <span>로그인 중</span>
            </span>
            <span className="top-nav__user-name">
              <span className="top-nav__user-mark" aria-hidden="true">
                <img className="top-nav__user-mark-icon" src={duckFacePictogram} alt="" />
              </span>
              <strong>{userName}</strong>
            </span>
          </div>
          <button className="text-button top-nav__logout" type="button" onClick={onLogout}>
            <LogOut size={15} strokeWidth={2.1} aria-hidden="true" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
