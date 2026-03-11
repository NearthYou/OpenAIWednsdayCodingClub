import { type FormEvent, useEffect, useState } from "react";
import { fetchKeywords } from "../api/client";
import { fallbackKeywords } from "../data/fallback-data";
import type { LoginRequest, SignupRequest } from "../types/auth";
import type { InterestKeyword } from "../types/event";

interface AuthGatewayPageProps {
  errorMessage: string;
  isSubmitting: boolean;
  onLogin: (payload: LoginRequest) => Promise<void>;
  onSignup: (payload: SignupRequest) => Promise<void>;
}

function toggleKeywordSelection(currentKeywordIds: string[], keywordId: string) {
  return currentKeywordIds.includes(keywordId)
    ? currentKeywordIds.filter((currentId) => currentId !== keywordId)
    : [...currentKeywordIds, keywordId];
}

export function AuthGatewayPage({
  errorMessage,
  isSubmitting,
  onLogin,
  onSignup
}: AuthGatewayPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [availableKeywords, setAvailableKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: "demo@ducking.club",
    password: "demo1234"
  });
  const [signupForm, setSignupForm] = useState<SignupRequest>({
    displayName: "",
    email: "",
    password: "",
    subscriptionKeywordIds: []
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadKeywords() {
      try {
        const keywords = await fetchKeywords();

        if (isMounted) {
          setAvailableKeywords(keywords);
        }
      } catch {
        if (isMounted) {
          setAvailableKeywords(fallbackKeywords);
        }
      }
    }

    void loadKeywords();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalErrorMessage("");

    if (mode === "login") {
      await onLogin(loginForm);
      return;
    }

    if (signupForm.password !== confirmPassword) {
      setLocalErrorMessage("Passwords do not match.");
      return;
    }

    await onSignup(signupForm);
  }

  return (
    <main className="page-shell auth-page">
      <section className="auth-layout">
        <article className="panel auth-sidebar">
          <p className="hero-eyebrow">Fandom MVP</p>
          <h1 className="auth-sidebar__title">Main home domain for fans who track every update.</h1>
          <p className="auth-sidebar__description">
            Sign in first, then move into the personalized home dashboard. The dashboard combines
            keyword subscriptions, calendar events, search discovery, and deadline tracking.
          </p>

          <div className="auth-sidebar__stack">
            <div className="auth-sidebar__card">
              <span>Search</span>
              <strong>Articles, schedules, and trends in one search surface</strong>
            </div>
            <div className="auth-sidebar__card">
              <span>Calendar bridge</span>
              <strong>D-day, today, and this week all derive from subscribed keywords</strong>
            </div>
            <div className="auth-sidebar__card">
              <span>Parallel-ready</span>
              <strong>Home, calendar, placeholders, and my page are split by route</strong>
            </div>
          </div>
        </article>

        <section className="panel auth-card">
          <div className="auth-card__header">
            <div>
              <p className="section-eyebrow">Authentication</p>
              <h2 className="section-title">Join or sign back in</h2>
            </div>
            <div className="auth-mode-switch" role="tablist" aria-label="Auth mode">
              <button
                className={mode === "login" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={mode === "signup" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="auth-field">
                <span>Display name</span>
                <input
                  value={signupForm.displayName}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      displayName: event.target.value
                    }))
                  }
                  placeholder="Your fandom alias"
                  required
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={mode === "login" ? loginForm.email : signupForm.email}
                onChange={(event) =>
                  mode === "login"
                    ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                    : setSignupForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                value={mode === "login" ? loginForm.password : signupForm.password}
                onChange={(event) =>
                  mode === "login"
                    ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                    : setSignupForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="At least 6 characters"
                required
              />
            </label>

            {mode === "signup" ? (
              <>
                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </label>

                <div className="auth-field">
                  <span>Subscription keywords</span>
                  <div className="auth-keyword-grid">
                    {availableKeywords.map((keyword) => {
                      const isSelected = signupForm.subscriptionKeywordIds.includes(keyword.id);

                      return (
                        <button
                          key={keyword.id}
                          className={`auth-keyword-chip${isSelected ? " is-selected" : ""}`}
                          type="button"
                          onClick={() =>
                            setSignupForm((current) => ({
                              ...current,
                              subscriptionKeywordIds: toggleKeywordSelection(
                                current.subscriptionKeywordIds,
                                keyword.id
                              )
                            }))
                          }
                        >
                          <span>{keyword.label}</span>
                          <small>{keyword.group}</small>
                        </button>
                      );
                    })}
                  </div>
                  <small className="auth-field__helper">
                    If you skip this step, the MVP assigns default fandom keywords.
                  </small>
                </div>
              </>
            ) : null}

            {localErrorMessage || errorMessage ? (
              <div className="notice-banner auth-notice">{localErrorMessage || errorMessage}</div>
            ) : null}

            <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Working..." : mode === "login" ? "Login to home" : "Create account"}
            </button>
          </form>

          <div className="auth-demo-box">
            <span>Quick demo</span>
            <strong>`demo@ducking.club` / `demo1234`</strong>
          </div>
        </section>
      </section>
    </main>
  );
}
