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
          <span className="top-nav__brand-mark">DC</span>
          <span className="top-nav__brand-copy">
            <strong>Ducking Club</strong>
            <small>Fandom home domain</small>
          </span>
        </button>

        <nav className="top-nav__links" aria-label="Primary">
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
            <span className="top-nav__user-label">Signed in</span>
            <strong>{userName}</strong>
          </div>
          <button className="text-button top-nav__logout" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
