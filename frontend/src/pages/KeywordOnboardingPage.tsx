import { useEffect, useState } from "react";
import { fetchKeywordRecommendations, fetchKeywords } from "../api/client";
import { fallbackKeywords } from "../data/fallback-data";
import type { AuthUser } from "../types/auth";
import type { InterestKeyword, KeywordRecommendation } from "../types/event";

const MIN_KEYWORD_SELECTION = 3;

interface KeywordOnboardingPageProps {
  currentUser: AuthUser;
  isSubmitting: boolean;
  errorMessage: string;
  onComplete: (seedKeywordIds: string[]) => Promise<void>;
}

function toggleKeywordSelection(currentKeywordIds: string[], keywordId: string) {
  return currentKeywordIds.includes(keywordId)
    ? currentKeywordIds.filter((currentId) => currentId !== keywordId)
    : [...currentKeywordIds, keywordId];
}

export function KeywordOnboardingPage({
  currentUser,
  isSubmitting,
  errorMessage,
  onComplete
}: KeywordOnboardingPageProps) {
  const [availableKeywords, setAvailableKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>(
    currentUser.preferenceKeywordIds.length
      ? currentUser.preferenceKeywordIds
      : currentUser.subscriptionKeywordIds
  );
  const [recommendedKeywords, setRecommendedKeywords] = useState<KeywordRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationErrorMessage, setRecommendationErrorMessage] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  useEffect(() => {
    setSelectedKeywordIds(
      currentUser.preferenceKeywordIds.length
        ? currentUser.preferenceKeywordIds
        : currentUser.subscriptionKeywordIds
    );
  }, [currentUser.preferenceKeywordIds, currentUser.subscriptionKeywordIds]);

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

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      if (selectedKeywordIds.length < MIN_KEYWORD_SELECTION) {
        setRecommendedKeywords([]);
        setRecommendationErrorMessage("");
        setIsLoadingRecommendations(false);
        return;
      }

      setIsLoadingRecommendations(true);
      setRecommendationErrorMessage("");

      try {
        const nextRecommendations = await fetchKeywordRecommendations(selectedKeywordIds);

        if (isMounted) {
          setRecommendedKeywords(nextRecommendations);
        }
      } catch {
        if (isMounted) {
          setRecommendedKeywords([]);
          setRecommendationErrorMessage("추천 키워드 미리보기를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecommendations(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [selectedKeywordIds]);

  async function handleComplete() {
    setLocalErrorMessage("");

    if (selectedKeywordIds.length < MIN_KEYWORD_SELECTION) {
      setLocalErrorMessage(`관심 키워드는 ${MIN_KEYWORD_SELECTION}개 이상 선택해 주세요.`);
      return;
    }

    try {
      await onComplete(selectedKeywordIds);
    } catch {
      // The parent page exposes the error banner, so the local page only prevents unhandled rejections.
    }
  }

  return (
    <main className="page-shell onboarding-page">
      <section className="panel onboarding-panel">
        <div className="onboarding-panel__hero">
          <div className="onboarding-panel__copy">
            <p className="hero-eyebrow">첫 로그인 온보딩</p>
            <h1 className="hero-title">{currentUser.displayName}님이 좋아하는 키워드를 골라 주세요</h1>
            <p className="hero-description">
              스포티파이처럼 처음 취향을 고르면 홈 추천, D-day, 곧 마감 일정, 검색 추천 키워드까지 이
              선택을 기준으로 맞춰집니다.
            </p>
          </div>

          <div className="onboarding-panel__stats">
            <div className="hero-stat-card">
              <span>선택한 키워드</span>
              <strong>{selectedKeywordIds.length}개</strong>
            </div>
            <div className="hero-stat-card">
              <span>최소 선택</span>
              <strong>{MIN_KEYWORD_SELECTION}개 이상</strong>
            </div>
            <div className="hero-stat-card">
              <span>AI 구독 결과</span>
              <strong>{recommendedKeywords.length ? `${recommendedKeywords.length}개 자동 선별` : "추천 계산 대기"}</strong>
            </div>
          </div>
        </div>

        <section className="panel dashboard-section onboarding-picker">
          <div className="dashboard-section__header">
            <div>
              <p className="section-eyebrow">취향 선택</p>
              <h2 className="section-title">좋아하는 덕질 키워드 고르기</h2>
            </div>
            <span className="section-helper">선택한 키워드는 입력값이고, 실제 구독은 AI 추천 세트로 만들어집니다.</span>
          </div>

          <div className="onboarding-keyword-grid">
            {availableKeywords.map((keyword) => {
              const isSelected = selectedKeywordIds.includes(keyword.id);

              return (
                <button
                  key={keyword.id}
                  className={`onboarding-keyword-chip${isSelected ? " is-selected" : ""}`}
                  type="button"
                  onClick={() =>
                    setSelectedKeywordIds((current) => toggleKeywordSelection(current, keyword.id))
                  }
                >
                  <span>{keyword.label}</span>
                  <small>{keyword.group}</small>
                  <strong>{isSelected ? "선택됨" : "선택하기"}</strong>
                </button>
              );
            })}
          </div>

          <section className="onboarding-preview">
            <div className="dashboard-section__header">
              <div>
                <p className="section-eyebrow">AI 추천 미리보기</p>
                <h3 className="section-title">홈에 자동 연결될 구독 키워드</h3>
              </div>
              <span className="section-helper">
                {selectedKeywordIds.length < MIN_KEYWORD_SELECTION
                  ? `${MIN_KEYWORD_SELECTION}개 이상 고르면 추천이 계산됩니다.`
                  : isLoadingRecommendations
                    ? "취향을 분석하는 중입니다..."
                    : `${recommendedKeywords.length}개 키워드가 홈 구독으로 연결됩니다.`}
              </span>
            </div>

            {recommendedKeywords.length ? (
              <div className="onboarding-preview-list">
                {recommendedKeywords.map((keyword) => (
                  <article
                    key={keyword.id}
                    className={`onboarding-preview-chip${
                      keyword.source === "selected" ? " is-selected-source" : ""
                    }`}
                  >
                    <div className="onboarding-preview-chip__meta">
                      <span>{keyword.label}</span>
                      <small>{keyword.group}</small>
                    </div>
                    <strong>
                      {keyword.source === "selected" ? "직접 고른 키워드" : "AI가 함께 추천한 키워드"}
                    </strong>
                    <p className="onboarding-preview-chip__reason">{keyword.reason}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="state-box state-box--empty">
                {recommendationErrorMessage ||
                  "취향 키워드를 고르면 홈 구독에 들어갈 추천 세트를 먼저 보여줍니다."}
              </div>
            )}
          </section>

          {localErrorMessage || errorMessage ? (
            <div className="notice-banner onboarding-notice">{localErrorMessage || errorMessage}</div>
          ) : null}

          <div className="onboarding-actions">
            <span className="section-helper">선택한 키워드는 시드로만 쓰고, 최종 구독은 위 추천 세트가 적용됩니다.</span>
            <button
              className="auth-submit-button"
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleComplete()}
            >
              {isSubmitting ? "반영 중..." : "AI 추천 구독 적용하기"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
