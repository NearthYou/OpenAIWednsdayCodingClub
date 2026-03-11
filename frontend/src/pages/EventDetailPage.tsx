import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import type { EventItem } from "../types/event";

interface EventDetailPageProps {
  event: EventItem;
  onBack: () => void;
}

function getSummaryPoints(event: EventItem) {
  const sourceLabel = SOURCE_TYPE_LABELS[event.sourceType];
  const categoryLabel = CATEGORY_LABELS[event.category];
  const tagLabel = event.tags.length ? event.tags.map((tag) => `#${tag}`).join(" ") : "관심 키워드 없음";

  return [
    `${event.entityName} 관련 ${categoryLabel} 일정으로, 선택한 날짜에서 바로 확인한 상세 정보입니다.`,
    `${sourceLabel} 출처인 ${event.sourceName} 기준으로 연결된 일정이라 팬이 확인해야 할 기준점이 명확합니다.`,
    `${tagLabel} 흐름으로 함께 보면 티켓, 굿즈, 후속 이벤트를 놓치지 않기 좋습니다.`
  ];
}

function getActionItems(event: EventItem) {
  return [
    "내 캘린더에 추가",
    `${event.entityName} 키워드 구독`,
    "출처 링크 열기",
    "친구에게 공유"
  ];
}

function getStatusMessage(event: EventItem) {
  if (event.sourceType === "official") {
    return "공식 채널 기준으로 확인된 일정이라 바로 저장해도 좋은 상태입니다.";
  }

  if (event.sourceType === "rumor") {
    return "루머 분류 일정이므로 저장 전 공식 채널 재확인이 필요합니다.";
  }

  return "팬 커뮤니티 기반 일정이라 공식 공지와 함께 비교해보는 것이 좋습니다.";
}

export function EventDetailPage({ event, onBack }: EventDetailPageProps) {
  const summaryPoints = getSummaryPoints(event);
  const actionItems = getActionItems(event);

  return (
    <main className="page-shell">
      <section className="panel detail-hero-panel">
        <div className="detail-hero-panel__top">
          <button className="text-button" type="button" onClick={onBack}>
            일정 캘린더로 돌아가기
          </button>
          <span className="detail-page-badge">Page 3</span>
        </div>

        <div className="detail-hero-panel__content">
          <div className="detail-hero-copy">
            <p className="hero-eyebrow">일정 상세 / AI 요약 모달</p>
            <h1 className="hero-title">{event.title}</h1>
            <p className="hero-description">
              1번 페이지에서 선택한 일정을 기준으로 출처, 핵심 요약, 다음 액션을 한 화면에서 확인할 수
              있습니다.
            </p>
          </div>

          <div className="detail-hero-stats">
            <div className="hero-stat-card">
              <span>선택 키워드</span>
              <strong>{event.entityName}</strong>
            </div>
            <div className="hero-stat-card">
              <span>출처 유형</span>
              <strong>{SOURCE_TYPE_LABELS[event.sourceType]}</strong>
            </div>
            <div className="hero-stat-card">
              <span>카테고리</span>
              <strong>{CATEGORY_LABELS[event.category]}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <article className="panel detail-info-panel">
          <div className="detail-panel__header">
            <div>
              <p className="section-eyebrow">이벤트 정보</p>
              <h2 className="section-title">이벤트명 / 날짜 / 장소</h2>
            </div>
            <span className={`status-badge status-badge--${event.sourceType}`}>
              {SOURCE_TYPE_LABELS[event.sourceType]}
            </span>
          </div>

          <dl className="detail-info-list">
            <div>
              <dt>이벤트명</dt>
              <dd>{event.title}</dd>
            </div>
            <div>
              <dt>날짜</dt>
              <dd>{formatEventTimeRange(event.startAt, event.endAt)}</dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>상세 장소 정보는 출처 링크에서 확인 가능</dd>
            </div>
          </dl>

          <div className="detail-link-card">
            <p className="section-eyebrow">출처 링크</p>
            <a href={event.sourceUrl} target="_blank" rel="noreferrer">
              {event.sourceName}
            </a>
          </div>

          <div className="detail-status-row">
            <span className="tag-chip">#{event.entityName}</span>
            {event.tags.map((tag) => (
              <span key={`${event.id}-${tag}`} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        <article className="panel detail-summary-panel">
          <div className="detail-panel__header">
            <div>
              <p className="section-eyebrow">AI 요약</p>
              <h2 className="section-title">핵심 일정 / 팬이 알아야 할 포인트</h2>
            </div>
          </div>

          <p className="detail-summary-copy">{getStatusMessage(event)}</p>

          <ul className="detail-summary-list">
            {summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className="detail-note-box">
            <p className="section-eyebrow">예약 / 응모 / 특전 정보 정리</p>
            <strong>현재 데모에서는 출처 기반 일정 요약과 후속 액션 진입을 우선 제공합니다.</strong>
            <span>다음 단계에서는 상세 장소, 예매 링크, 특전 여부를 API 응답과 연결할 수 있습니다.</span>
          </div>
        </article>

        <aside className="panel detail-action-panel">
          <div className="detail-panel__header">
            <div>
              <p className="section-eyebrow">액션</p>
              <h2 className="section-title">다음에 할 일</h2>
            </div>
          </div>

          <p className="detail-action-copy">
            사용자가 가장 자주 하는 행동을 바로 누를 수 있게 묶었습니다.
          </p>

          <div className="detail-action-list">
            {actionItems.map((actionItem) => (
              <button key={actionItem} className="detail-action-button" type="button">
                {actionItem}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
