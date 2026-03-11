import { useEffect, useState } from "react";
import { fetchKeywords } from "../api/client";
import { fallbackKeywords } from "../data/fallback-data";
import type { AuthUser } from "../types/auth";
import type { InterestKeyword } from "../types/event";

interface MyProfilePageProps {
  currentUser: AuthUser;
}

export function MyProfilePage({ currentUser }: MyProfilePageProps) {
  const [keywords, setKeywords] = useState<InterestKeyword[]>(fallbackKeywords);

  useEffect(() => {
    let isMounted = true;

    async function loadKeywords() {
      try {
        const nextKeywords = await fetchKeywords();

        if (isMounted) {
          setKeywords(nextKeywords);
        }
      } catch {
        if (isMounted) {
          setKeywords(fallbackKeywords);
        }
      }
    }

    void loadKeywords();

    return () => {
      isMounted = false;
    };
  }, []);

  const subscribedKeywords = keywords.filter((keyword) =>
    currentUser.subscriptionKeywordIds.includes(keyword.id)
  );

  return (
    <main className="page-shell profile-page">
      <section className="profile-grid">
        <article className="panel profile-card">
          <p className="section-eyebrow">프로필</p>
          <h1 className="hero-title">{currentUser.displayName}님</h1>
          <p className="hero-description">{currentUser.email}</p>
          <div className="profile-card__meta">
            <span>사용자 ID</span>
            <strong>{currentUser.id}</strong>
          </div>
        </article>

        <article className="panel profile-card">
          <p className="section-eyebrow">구독 키워드</p>
          <h2 className="section-title">홈 대시보드에 연결된 관심 키워드</h2>
          <div className="related-keyword-list">
            {subscribedKeywords.map((keyword) => (
              <span key={keyword.id} className="keyword-summary-chip">
                {keyword.label}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
