import { useEffect, useState } from "react";
import { fetchEventSummary } from "../api/client";
import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import type { EventAiSummary, EventAiSummaryMeta, EventItem } from "../types/event";

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

function getVenueGuide(event: EventItem) {
  if (event.category === "goods_release") {
    return "판매처 공식 스토어 또는 예약 오픈 페이지에서 상세 정보를 확인";
  }

  if (event.category === "birthday") {
    return "공식 SNS나 게임 내 공지에서 기념 콘텐츠 공개 여부를 확인";
  }

  if (event.category === "fan_event") {
    return "팬 커뮤니티 공지 또는 모임 안내 페이지에서 장소와 입장 조건을 확인";
  }

  if (event.category === "artist") {
    return event.tags.includes("예매")
      ? "티켓 오픈 페이지에서 좌석/예매 시간 확인"
      : "공식 채널 또는 배급/공연 안내 페이지에서 상세 일정 확인";
  }

  return event.sourceType === "rumor"
    ? "커뮤니티 제보 기반이라 공식 채널의 추가 공지 확인이 필요"
    : "공식 방송 또는 행사 안내 페이지에서 세부 시간표 확인";
}

function getHighlightCards(event: EventItem) {
  const sourceGuide =
    event.sourceType === "official"
      ? "바로 저장해도 되는 일정"
      : event.sourceType === "community"
        ? "공식 공지와 함께 비교 확인"
        : "반드시 공식 채널 재확인";

  const followUpGuide =
    event.category === "goods_release"
      ? "판매 링크와 재입고 공지를 같이 체크"
      : event.category === "fan_event"
        ? "장소/참가 방식/현장 준비물 체크"
        : event.category === "birthday"
          ? "기념 콘텐츠 공개 시간 체크"
          : "티켓, 후속 공지, 굿즈 연계 일정 체크";

  return [
    {
      title: "핵심 일정",
      value: formatEventTimeRange(event.startAt, event.endAt)
    },
    {
      title: "출처 상태",
      value: sourceGuide
    },
    {
      title: "팬 체크포인트",
      value: followUpGuide
    }
  ];
}

function getChecklistItems(event: EventItem) {
  const reservationGuide =
    event.tags.includes("예매") || event.tags.includes("예약")
      ? `${event.tags.find((tag) => tag === "예매" || tag === "예약")} 일정이므로 오픈 시간 전에 대기 동선을 잡아두는 것이 좋습니다.`
      : event.category === "fan_event"
        ? "참가 신청 여부와 입장 조건을 먼저 확인하세요."
        : "별도 예약이 없어도 공지 업데이트를 함께 체크하는 편이 안전합니다.";

  const bonusGuide =
    event.category === "goods_release"
      ? "특전, 한정 수량, 배송 일정처럼 판매 조건이 달라질 수 있는 정보를 같이 확인하세요."
      : event.category === "birthday"
        ? "생일 일러스트, 축전, 해시태그 이벤트처럼 당일 공개 콘텐츠가 추가될 수 있습니다."
        : "현장 혜택, 굿즈 동시 오픈, 후속 공지처럼 같은 키워드의 연계 이벤트를 같이 보세요.";

  const verificationGuide =
    event.sourceType === "official"
      ? "공식 채널 기준 일정이므로 캘린더 저장 우선순위를 높여도 됩니다."
      : event.sourceType === "community"
        ? "팬 커뮤니티 기반 일정이라 공식 채널의 후속 공지를 한 번 더 확인하세요."
        : "루머 단계라 저장은 하되 알림 문구에 재확인 표시를 남기는 편이 좋습니다.";

  return [
    { label: "예약 / 응모", value: reservationGuide },
    { label: "특전 / 추가 정보", value: bonusGuide },
    { label: "재확인 포인트", value: verificationGuide }
  ];
}

function getActionItems(event: EventItem) {
  return [
    {
      label: "내 캘린더 추가",
      description: "선택한 날짜와 키워드 흐름을 그대로 저장"
    },
    {
      label: "좋아요",
      description: "중요 일정으로 표시하고 다시 보기"
    },
    {
      label: "공유",
      description: "덕메에게 일정 링크 전달"
    },
    {
      label: "댓글",
      description: "팬 메모나 체크 포인트 남기기"
    },
    {
      label: `${event.entityName} 구독`,
      description: "같은 키워드의 후속 일정까지 이어서 보기"
    }
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

function buildFallbackSummary(event: EventItem): EventAiSummary {
  const [highlightSchedule, highlightSourceStatus, highlightFanCheckpoint] = getHighlightCards(event).map(
    (card) => card.value
  );
  const [reservationGuide, bonusGuide, verificationGuide] = getChecklistItems(event).map(
    (item) => item.value
  );

  return {
    statusMessage: getStatusMessage(event),
    summaryPoints: getSummaryPoints(event),
    highlightSchedule,
    highlightSourceStatus,
    highlightFanCheckpoint,
    reservationGuide,
    bonusGuide,
    verificationGuide
  };
}

export function EventDetailPage({ event, onBack }: EventDetailPageProps) {
  const actionItems = getActionItems(event);
  const primaryAction = actionItems[0];
  const secondaryActions = actionItems.slice(1, 4);
  const followUpAction = actionItems[4];
  const fallbackSummary = buildFallbackSummary(event);
  const [aiSummary, setAiSummary] = useState<EventAiSummary | null>(null);
  const [summaryMeta, setSummaryMeta] = useState<EventAiSummaryMeta | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setAiSummary(null);
      setSummaryMeta(null);
      setSummaryError("");
      setIsSummaryLoading(true);

      try {
        const payload = await fetchEventSummary(event.id);

        if (!isMounted) {
          return;
        }

        setAiSummary(payload.summary);
        setSummaryMeta(payload.meta);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSummaryError(
          error instanceof Error ? error.message : "OpenAI 요약을 불러오지 못했습니다."
        );
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [event.id]);

  const activeSummary = aiSummary || fallbackSummary;
  const highlightCards = [
    { title: "핵심 일정", value: activeSummary.highlightSchedule },
    { title: "출처 상태", value: activeSummary.highlightSourceStatus },
    { title: "팬 체크포인트", value: activeSummary.highlightFanCheckpoint }
  ];
  const checklistItems = [
    { label: "예약 / 응모", value: activeSummary.reservationGuide },
    { label: "특전 / 추가 정보", value: activeSummary.bonusGuide },
    { label: "재확인 포인트", value: activeSummary.verificationGuide }
  ];
  const summaryTone = isSummaryLoading ? "loading" : aiSummary ? "live" : "fallback";
  const summaryNotice = isSummaryLoading
    ? "OpenAI가 요약을 생성하는 동안 규칙 기반 요약을 먼저 보여주고 있습니다."
    : aiSummary && summaryMeta
      ? `OpenAI ${summaryMeta.model} 응답으로 생성한 요약입니다.`
      : `${summaryError || "OpenAI 요약을 불러오지 못했습니다."} 규칙 기반 요약을 표시 중입니다.`;

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
              <dd>{getVenueGuide(event)}</dd>
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
            <span className={`detail-ai-badge detail-ai-badge--${summaryTone}`}>
              {isSummaryLoading ? "생성 중" : aiSummary ? "OpenAI Live" : "Fallback"}
            </span>
          </div>

          <p className="detail-summary-hint">{summaryNotice}</p>

          <p className="detail-summary-copy">{activeSummary.statusMessage}</p>

          <div className="detail-highlight-grid">
            {highlightCards.map((card) => (
              <div key={card.title} className="detail-highlight-card">
                <span>{card.title}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <ul className="detail-summary-list">
            {activeSummary.summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className="detail-note-box">
            <p className="section-eyebrow">예약 / 응모 / 특전 정보 정리</p>
            <div className="detail-checklist">
              {checklistItems.map((item) => (
                <div key={item.label} className="detail-checklist-row">
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
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
            와이어프레임의 액션 묶음을 그대로 살려서 저장, 반응, 공유 흐름을 한 번에 두었습니다.
          </p>

          <div className="detail-action-primary">
            <button className="detail-primary-button" type="button">
              {primaryAction.label}
            </button>
            <span>{primaryAction.description}</span>
          </div>

          <div className="detail-action-grid">
            {secondaryActions.map((actionItem) => (
              <button key={actionItem.label} className="detail-action-button" type="button">
                <strong>{actionItem.label}</strong>
                <span>{actionItem.description}</span>
              </button>
            ))}
          </div>

          <div className="detail-action-note">
            <strong>{followUpAction.label}</strong>
            <span>{followUpAction.description}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
