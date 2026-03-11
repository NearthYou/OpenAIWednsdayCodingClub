import { startTransition, useEffect, useState } from "react";
import { fetchSession, loginUser, logoutUser, signupUser } from "./api/client";
import { MainNavigationBar } from "./components/MainNavigationBar";
import { APP_ROUTE_PATHS, normalizeAppRoute, type AppRoutePath } from "./constants/app-routes";
import { AuthGatewayPage } from "./pages/AuthGatewayPage";
import { CalendarPage } from "./pages/CalendarPage";
import { GoodsExplorePage } from "./pages/GoodsExplorePage";
import { HomeDashboardPage } from "./pages/HomeDashboardPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import { ReservedRoutePage } from "./pages/ReservedRoutePage";
import type { AuthSessionPayload, LoginRequest, SignupRequest } from "./types/auth";

const SESSION_STORAGE_KEY = "fandom.home.session-token";

function getStoredSessionToken() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
}

function setStoredSessionToken(sessionToken: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
}

function clearStoredSessionToken() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function getInitialRoute(): AppRoutePath {
  return normalizeAppRoute(window.location.pathname) || APP_ROUTE_PATHS.home;
}

export default function App() {
  const [route, setRoute] = useState<AppRoutePath>(() => getInitialRoute());
  const [authSession, setAuthSession] = useState<AuthSessionPayload | null>(null);
  const [authState, setAuthState] = useState<"loading" | "anonymous" | "authenticated">("loading");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  function navigate(nextRoute: AppRoutePath, options?: { replace?: boolean }) {
    const shouldReplace = options?.replace ?? false;

    if (window.location.pathname !== nextRoute) {
      window.history[shouldReplace ? "replaceState" : "pushState"]({}, "", nextRoute);
    }

    startTransition(() => {
      setRoute(nextRoute);
    });
  }

  useEffect(() => {
    function handlePopState() {
      const nextRoute = normalizeAppRoute(window.location.pathname);
      setRoute(nextRoute || (authSession ? APP_ROUTE_PATHS.home : APP_ROUTE_PATHS.auth));
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [authSession]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const sessionToken = getStoredSessionToken();

      if (!sessionToken) {
        if (!isMounted) {
          return;
        }

        setAuthState("anonymous");
        navigate(APP_ROUTE_PATHS.auth, { replace: true });
        return;
      }

      try {
        const session = await fetchSession(sessionToken);

        if (!isMounted) {
          return;
        }

        setAuthSession(session);
        setAuthState("authenticated");

        const nextRoute = normalizeAppRoute(window.location.pathname);
        navigate(nextRoute && nextRoute !== APP_ROUTE_PATHS.auth ? nextRoute : APP_ROUTE_PATHS.home, {
          replace: true
        });
      } catch {
        clearStoredSessionToken();

        if (!isMounted) {
          return;
        }

        setAuthSession(null);
        setAuthState("anonymous");
        navigate(APP_ROUTE_PATHS.auth, { replace: true });
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAuthSuccess(session: AuthSessionPayload) {
    setStoredSessionToken(session.sessionToken);
    setAuthSession(session);
    setAuthState("authenticated");
    setAuthErrorMessage("");
    navigate(APP_ROUTE_PATHS.home, { replace: true });
  }

  async function handleLogin(payload: LoginRequest) {
    setIsSubmittingAuth(true);
    setAuthErrorMessage("");

    try {
      const session = await loginUser(payload);
      await handleAuthSuccess(session);
    } catch (error) {
      setAuthErrorMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleSignup(payload: SignupRequest) {
    setIsSubmittingAuth(true);
    setAuthErrorMessage("");

    try {
      const session = await signupUser(payload);
      await handleAuthSuccess(session);
    } catch (error) {
      setAuthErrorMessage(error instanceof Error ? error.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleLogout() {
    const sessionToken = authSession?.sessionToken;

    try {
      if (sessionToken) {
        await logoutUser(sessionToken);
      }
    } catch {
      // Ignore logout failures because the local token controls the MVP flow.
    } finally {
      clearStoredSessionToken();
      setAuthSession(null);
      setAuthState("anonymous");
      navigate(APP_ROUTE_PATHS.auth, { replace: true });
    }
  }

  if (authState === "loading") {
    return <div className="app-loading-screen">덕질 홈을 준비하는 중입니다...</div>;
  }

  if (authState !== "authenticated" || !authSession) {
    return (
      <AuthGatewayPage
        errorMessage={authErrorMessage}
        isSubmitting={isSubmittingAuth}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <div className="app-shell">
      <MainNavigationBar
        currentRoute={route}
        userName={authSession.user.displayName}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {route === APP_ROUTE_PATHS.home ? (
        <HomeDashboardPage
          currentUser={authSession.user}
          sessionToken={authSession.sessionToken}
          onNavigateToCalendar={() => navigate(APP_ROUTE_PATHS.calendar)}
        />
      ) : null}

      {route === APP_ROUTE_PATHS.calendar ? <CalendarPage /> : null}

      {route === APP_ROUTE_PATHS.pageTwo ? <GoodsExplorePage /> : null}

      {route === APP_ROUTE_PATHS.pageThree ? (
        <ReservedRoutePage
          eyebrow="분리된 라우트"
          title="페이지3 준비 중"
          description="이 경로는 다른 팀원이 작업할 수 있도록 비워 둔 자리입니다. 경로는 유지하고 내부 구현만 교체하면 됩니다."
          routeLabel={APP_ROUTE_PATHS.pageThree}
        />
      ) : null}

      {route === APP_ROUTE_PATHS.myPage ? <MyProfilePage currentUser={authSession.user} /> : null}
    </div>
  );
}
