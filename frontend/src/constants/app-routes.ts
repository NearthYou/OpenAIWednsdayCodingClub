export const APP_ROUTE_PATHS = {
  auth: "/auth",
  home: "/home",
  calendar: "/calendar",
  pageTwo: "/reserved/page-two",
  pageThree: "/reserved/page-three",
  myPage: "/my-page"
} as const;

export type AppRoutePath = (typeof APP_ROUTE_PATHS)[keyof typeof APP_ROUTE_PATHS];

export const APP_NAVIGATION_ITEMS: Array<{
  label: string;
  path: AppRoutePath;
}> = [
  { label: "Home", path: APP_ROUTE_PATHS.home },
  { label: "Calendar", path: APP_ROUTE_PATHS.calendar },
  { label: "Page 2", path: APP_ROUTE_PATHS.pageTwo },
  { label: "Page 3", path: APP_ROUTE_PATHS.pageThree },
  { label: "My Page", path: APP_ROUTE_PATHS.myPage }
];

const KNOWN_ROUTE_SET = new Set<string>(Object.values(APP_ROUTE_PATHS));

export function isAppRoutePath(pathname: string): pathname is AppRoutePath {
  return KNOWN_ROUTE_SET.has(pathname);
}

export function normalizeAppRoute(pathname: string) {
  if (!pathname || pathname === "/") {
    return null;
  }

  return isAppRoutePath(pathname) ? pathname : null;
}
