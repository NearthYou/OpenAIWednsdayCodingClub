import { useEffect, useState } from "react";
import { fetchKeywords } from "../api/client";
import { fallbackKeywords } from "../data/fallback-data";
import type { AuthUser } from "../types/auth";
import type { InterestKeyword, SavedScheduleItem } from "../types/event";
import { formatDateLabel, formatEventTimeRange } from "../utils/date";

const SAVED_SCHEDULES_PER_PAGE = 3;

interface MyProfilePageProps {
  currentUser: AuthUser;
  savedSchedules: SavedScheduleItem[];
  onRemoveSavedSchedule: (scheduleId: string) => void;
}

export function MyProfilePage({
  currentUser,
  savedSchedules,
  onRemoveSavedSchedule
}: MyProfilePageProps) {
  const [keywords, setKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [savedSchedulesPage, setSavedSchedulesPage] = useState(1);

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

  return (
    <main className="page-shell profile-page">
      <section className="profile-grid">
        <article className="panel profile-card profile-card--identity">
          <p className="section-eyebrow">프로필</p>
          <h1 className="hero-title">{currentUser.displayName}님</h1>
          <p className="hero-description">{currentUser.email}</p>
          <div className="profile-card__meta">
            <span>사용자 ID</span>
            <strong>{currentUser.id}</strong>
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
