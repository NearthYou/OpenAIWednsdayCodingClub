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
          <p className="section-eyebrow">Profile</p>
          <h1 className="hero-title">{currentUser.displayName}</h1>
          <p className="hero-description">{currentUser.email}</p>
          <div className="profile-card__meta">
            <span>User id</span>
            <strong>{currentUser.id}</strong>
          </div>
        </article>

        <article className="panel profile-card">
          <p className="section-eyebrow">Subscriptions</p>
          <h2 className="section-title">Keyword set for the home dashboard</h2>
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
