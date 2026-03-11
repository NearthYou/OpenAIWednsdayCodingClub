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
      setLocalErrorMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    await onSignup(signupForm);
  }

  return (
    <main className="page-shell auth-page">
      <section className="auth-layout auth-layout--single">
        <section className="panel auth-card auth-card--single">
          <div className="auth-card__header auth-card__header--stacked">
            <div>
              <p className="section-eyebrow">덕통사고</p>
              <h1 className="section-title">{mode === "login" ? "로그인" : "회원가입"}</h1>
            </div>

            <div className="auth-mode-switch" role="tablist" aria-label="인증 모드">
              <button
                className={mode === "login" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("login")}
              >
                로그인
              </button>
              <button
                className={mode === "signup" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("signup")}
              >
                회원가입
              </button>
            </div>
          </div>

          <form className="auth-form auth-form--single" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="auth-field">
                <span>닉네임</span>
                <input
                  value={signupForm.displayName}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      displayName: event.target.value
                    }))
                  }
                  placeholder="덕질할 때 사용할 이름"
                  required
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>{mode === "login" ? "아이디" : "이메일"}</span>
              <input
                type="email"
                autoComplete={mode === "login" ? "email" : "username"}
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
              <span>비밀번호</span>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={mode === "login" ? loginForm.password : signupForm.password}
                onChange={(event) =>
                  mode === "login"
                    ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                    : setSignupForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="6자 이상 입력"
                required
              />
            </label>

            {mode === "signup" ? (
              <>
                <label className="auth-field">
                  <span>비밀번호 확인</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="비밀번호를 다시 입력"
                    required
                  />
                </label>

                <div className="auth-field">
                  <span>관심 키워드</span>
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
                    선택하지 않으면 기본 관심 키워드가 자동으로 적용됩니다.
                  </small>
                </div>
              </>
            ) : null}

            {localErrorMessage || errorMessage ? (
              <div className="notice-banner auth-notice">{localErrorMessage || errorMessage}</div>
            ) : null}

            <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
