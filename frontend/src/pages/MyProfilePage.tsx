import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchKeywords } from "../api/client";
import { fallbackKeywords } from "../data/fallback-data";
import type { AuthUser } from "../types/auth";
import type { InterestKeyword, SavedScheduleItem } from "../types/event";
import { formatDateLabel, formatEventTimeRange } from "../utils/date";
import { getKeywordImage } from "../utils/keyword-images";

const SAVED_SCHEDULES_PER_PAGE = 3;

function getFeaturedKeywordLabel(
  savedSchedules: SavedScheduleItem[],
  preferredKeywords: InterestKeyword[]
) {
  const keywordCounts = new Map<string, number>();

  savedSchedules.forEach((schedule) => {
    const normalizedLabel = schedule.entityName.trim();
    if (!normalizedLabel) {
      return;
    }

    keywordCounts.set(normalizedLabel, (keywordCounts.get(normalizedLabel) || 0) + 1);
  });

  const featuredSavedKeyword = [...keywordCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label]) => label)
    .find((label) => Boolean(getKeywordImage(label)));

  if (featuredSavedKeyword) {
    return featuredSavedKeyword;
  }

  return preferredKeywords.find((keyword) => Boolean(getKeywordImage(keyword.label)))?.label || null;
}

interface MyProfilePageProps {
  currentUser: AuthUser;
  savedSchedules: SavedScheduleItem[];
  onRemoveSavedSchedule: (scheduleId: string) => void;
  onUpdateDisplayName: (displayName: string) => Promise<unknown>;
}

export function MyProfilePage({
  currentUser,
  savedSchedules,
  onRemoveSavedSchedule,
  onUpdateDisplayName
}: MyProfilePageProps) {
  const [keywords, setKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [savedSchedulesPage, setSavedSchedulesPage] = useState(1);
  const [displayNameDraft, setDisplayNameDraft] = useState(currentUser.displayName);
  const [isUpdatingDisplayName, setIsUpdatingDisplayName] = useState(false);
  const [displayNameFeedback, setDisplayNameFeedback] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

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

  const preferredKeywords = keywords.filter((keyword) =>
    currentUser.preferenceKeywordIds.includes(keyword.id)
  );
  const featuredKeywordLabel = useMemo(
    () => getFeaturedKeywordLabel(savedSchedules, preferredKeywords),
    [preferredKeywords, savedSchedules]
  );
  const featuredKeywordImage = featuredKeywordLabel ? getKeywordImage(featuredKeywordLabel) : null;
  const upcomingSavedSchedules = [...savedSchedules];
  const totalSavedSchedulePages = Math.max(
    1,
    Math.ceil(upcomingSavedSchedules.length / SAVED_SCHEDULES_PER_PAGE)
  );
  const visibleSavedSchedules = upcomingSavedSchedules.slice(
    (savedSchedulesPage - 1) * SAVED_SCHEDULES_PER_PAGE,
    savedSchedulesPage * SAVED_SCHEDULES_PER_PAGE
  );

  useEffect(() => {
    if (savedSchedulesPage > totalSavedSchedulePages) {
      setSavedSchedulesPage(totalSavedSchedulePages);
    }
  }, [savedSchedulesPage, totalSavedSchedulePages]);

  useEffect(() => {
    setDisplayNameDraft(currentUser.displayName);
  }, [currentUser.displayName]);

  async function handleDisplayNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDisplayName = displayNameDraft.trim();
    setDisplayNameFeedback("");
    setDisplayNameError("");

    if (!nextDisplayName) {
      setDisplayNameError("닉네임을 입력해 주세요.");
      return;
    }

    if (nextDisplayName === currentUser.displayName) {
      setDisplayNameFeedback("현재 닉네임과 같습니다.");
      return;
    }

    setIsUpdatingDisplayName(true);

    try {
      await onUpdateDisplayName(nextDisplayName);
      setDisplayNameFeedback("닉네임을 저장했습니다.");
    } catch (error) {
      setDisplayNameError(error instanceof Error ? error.message : "닉네임 저장에 실패했습니다.");
    } finally {
      setIsUpdatingDisplayName(false);
    }
  }

  return (
    <main className="page-shell profile-page">
      <section className="profile-grid">
        <article className="panel profile-card profile-card--identity">
          <p className="section-eyebrow">프로필</p>
          <div className="profile-card__identity-block">
            <div className="profile-card__headline">
              <div className="profile-card__headline-copy">
                <h1 className="hero-title profile-card__name">{currentUser.displayName}</h1>
                <p className="hero-description profile-card__email">{currentUser.email}</p>
              </div>
              {featuredKeywordImage ? (
                <figure className="profile-card__featured-media" aria-label={`${featuredKeywordLabel} 대표 이미지`}>
                  <img src={featuredKeywordImage} alt="" className="profile-card__featured-image" loading="lazy" />
                  <figcaption className="profile-card__featured-caption">
                    {featuredKeywordLabel}
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </div>
          <form className="profile-name-form" onSubmit={handleDisplayNameSubmit}>
            <label className="auth-field profile-name-form__field">
              <span>닉네임 변경</span>
              <input
                type="text"
                value={displayNameDraft}
                maxLength={8}
                onChange={(event) => setDisplayNameDraft(event.target.value)}
                placeholder="새 닉네임을 입력해 주세요"
              />
            </label>
            <div className="profile-name-form__actions">
              <button
                className="text-button"
                type="submit"
                disabled={isUpdatingDisplayName}
              >
                {isUpdatingDisplayName ? "저장 중..." : "닉네임 저장"}
              </button>
              <span className="section-helper">2자 이상 8자 이하로 입력해 주세요.</span>
            </div>
            {displayNameFeedback ? (
              <p className="profile-name-form__feedback" role="status">
                {displayNameFeedback}
              </p>
            ) : null}
            {displayNameError ? (
              <p className="profile-name-form__error" role="alert">
                {displayNameError}
              </p>
            ) : null}
          </form>
          <div className="profile-card__intro">
            <strong>오늘도 좋아하는 마음을 놓치지 않도록</strong>
            <span>캘린더와 내 일정에 이번 달의 설렘을 차곡차곡 모아두고 있어요.</span>
          </div>
        </article>

        <article className="panel profile-card profile-card--schedule-list">
          <p className="section-eyebrow">내 일정 목록</p>
          <h2 className="section-title">예정 일정</h2>

          {upcomingSavedSchedules.length ? (
            <>
              <div className="saved-schedule-list">
                {visibleSavedSchedules.map((schedule) => (
                  <div key={schedule.id} className="saved-schedule-item">
                    <div className="saved-schedule-item__copy">
                      <div className="saved-schedule-item__meta">
                        <span>{schedule.entityName}</span>
                        <strong>{schedule.typeLabel}</strong>
                      </div>
                      <h3>{schedule.title}</h3>
                      <p>
                        {schedule.startAt
                          ? formatEventTimeRange(schedule.startAt, schedule.endAt || undefined)
                          : formatDateLabel(schedule.dateKey)}
                      </p>
                    </div>

                    <button
                      className="text-button saved-schedule-remove"
                      type="button"
                      onClick={() => onRemoveSavedSchedule(schedule.id)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>

              <div className="saved-schedule-pagination">
                <span>
                  {savedSchedulesPage} / {totalSavedSchedulePages}
                </span>
                <div className="saved-schedule-pagination__actions">
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setSavedSchedulesPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={savedSchedulesPage === 1}
                  >
                    이전
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      setSavedSchedulesPage((currentPage) =>
                        Math.min(totalSavedSchedulePages, currentPage + 1)
                      )
                    }
                    disabled={savedSchedulesPage === totalSavedSchedulePages}
                  >
                    다음
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="state-box state-box--empty">
              아직 저장한 일정이 없습니다. 상세 페이지의 `내 캘린더 추가` 버튼으로 일정을 모아보세요.
            </div>
          )}
        </article>

        <article className="panel profile-card profile-card--preferences">
          <p className="section-eyebrow">취향 입력</p>
          <h2 className="section-title">처음 고른 선호 키워드</h2>
          <div className="related-keyword-list">
            {preferredKeywords.map((keyword) => (
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
