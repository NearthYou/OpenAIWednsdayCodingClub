import { useEffect, useState } from "react";
import { fetchEventDetail, fetchEventSummary } from "../api/client";
import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import type {
  EventAiSummary,
  EventAiSummaryMeta,
  EventItem,
  SavedScheduleItem
} from "../types/event";
import { formatEventTimeRange } from "../utils/date";
import type { DetailPageItem } from "../utils/detail-page-item";
import { buildSavedScheduleItem } from "../utils/saved-schedules";

interface EventDetailPageProps {
  item: DetailPageItem;
  onBack: () => void;
  savedSchedules: SavedScheduleItem[];
  onSaveSchedule: (schedule: SavedScheduleItem) => void;
  backLabel?: string;
}

function formatDetailTimeRange(startAt: string | null, endAt?: string | null) {
  if (!startAt) {
    return "날짜 정보는 외부 링크에서 확인하세요.";
  }

  return formatEventTimeRange(startAt, endAt || undefined);
}

function getSummaryPoints(event: EventItem) {
  const sourceLabel = SOURCE_TYPE_LABELS[event.sourceType];
  const categoryLabel = CATEGORY_LABELS[event.category];
  const tagLabel = event.tags.length ? event.tags.map((tag) => `#${tag}`).join(" ") : "관심 키워드 없음";

  return [
    `${event.entityName} 관련 ${categoryLabel} 일정으로, 선택한 화면에서 바로 확인한 상세 정보입니다.`,
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

function buildGenericSummary(item: DetailPageItem): EventAiSummary {
  const detailTime = formatDetailTimeRange(item.startAt, item.endAt);
  const tagText = item.tags.length ? item.tags.map((tag) => `#${tag}`).join(" ") : "관련 태그 없음";

  return {
    statusMessage: item.summary,
    summaryPoints: [
      `${item.entityName} 관련 ${item.typeLabel}입니다. 홈과 캘린더에서 확인한 내용을 먼저 한 화면에 정리했습니다.`,
      `${item.sourceName} 기준 정보라서 저장, 좋아요, 공유를 먼저 처리한 뒤 마지막에 외부 링크로 이동하면 됩니다.`,
      `${tagText} 흐름으로 함께 보면 후속 일정이나 연관 공지를 이어서 확인하기 좋습니다.`
    ],
    highlightSchedule: detailTime,
    highlightSourceStatus: `${item.badgeLabel} 기준 정보`,
    highlightFanCheckpoint: "저장과 공유를 먼저 하고 마지막에 외부 사이트로 이동",
    reservationGuide: item.startAt
      ? `${detailTime} 기준으로 일정 시간을 먼저 확인해두세요.`
      : "날짜와 시간은 맨 아래 외부 링크에서 다시 확인하세요.",
    bonusGuide: item.summary,
    verificationGuide: "외부 사이트 연결은 맨 아래에 두었으니, 이 화면에서 필요한 액션을 먼저 마무리하세요."
  };
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function EventDetailPage({
  item,
  onBack,
  savedSchedules,
  onSaveSchedule,
  backLabel = "이전 화면으로 돌아가기"
}: EventDetailPageProps) {
  const [eventData, setEventData] = useState<EventItem | null>(item.eventData);
  const [eventError, setEventError] = useState("");
  const [isEventLoading, setIsEventLoading] = useState(Boolean(item.sourceEventId && !item.eventData));
  const [aiSummary, setAiSummary] = useState<EventAiSummary | null>(null);
  const [summaryMeta, setSummaryMeta] = useState<EventAiSummaryMeta | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(Boolean(item.eventData));
  const [isLiked, setIsLiked] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setEventData(item.eventData);
    setEventError("");
    setIsLiked(false);
    setActionMessage("");
    setIsLinkCopied(false);

    if (item.eventData || !item.sourceEventId) {
      setIsEventLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsEventLoading(true);

    async function loadEventDetail() {
      try {
        const nextEvent = await fetchEventDetail(item.sourceEventId!);

        if (!isMounted) {
          return;
        }

        setEventData(nextEvent);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setEventError(error instanceof Error ? error.message : "상세 일정을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsEventLoading(false);
        }
      }
    }

    void loadEventDetail();

    return () => {
      isMounted = false;
    };
  }, [item]);

  useEffect(() => {
    let isMounted = true;

    if (!eventData) {
      setAiSummary(null);
      setSummaryMeta(null);
      setSummaryError("");
      setIsSummaryLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const summaryTarget = eventData;

    async function loadSummary() {
      setAiSummary(null);
      setSummaryMeta(null);
      setSummaryError("");
      setIsSummaryLoading(true);

      try {
        const payload = await fetchEventSummary(summaryTarget.id);

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
  }, [eventData]);

  const resolvedTitle = eventData?.title || item.title;
  const resolvedEntityName = eventData?.entityName || item.entityName;
  const resolvedTypeLabel = eventData ? CATEGORY_LABELS[eventData.category] : item.typeLabel;
  const resolvedBadgeVariant = eventData?.sourceType || item.badgeVariant;
  const resolvedBadgeLabel = eventData ? SOURCE_TYPE_LABELS[eventData.sourceType] : item.badgeLabel;
  const resolvedSourceName = eventData?.sourceName || item.sourceName;
  const resolvedSourceUrl = eventData?.sourceUrl || item.sourceUrl;
  const resolvedStartAt = eventData?.startAt || item.startAt;
  const resolvedEndAt = eventData?.endAt || item.endAt;
  const resolvedTags = eventData?.tags.length ? eventData.tags : item.tags;
  const resolvedVenueGuide = eventData ? getVenueGuide(eventData) : item.venueGuide;
  const savedSchedule = buildSavedScheduleItem(item, eventData);
  const isCalendarAdded = savedSchedule
    ? savedSchedules.some((currentSchedule) => currentSchedule.id === savedSchedule.id)
    : false;

  const fallbackSummary = eventData ? buildFallbackSummary(eventData) : buildGenericSummary(item);
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
  const summaryTone = eventData
    ? isSummaryLoading
      ? "loading"
      : aiSummary
        ? "live"
        : "fallback"
    : "fallback";
  const summaryNotice = !eventData
    ? isEventLoading
      ? "상세 캘린더 원본 정보를 불러오는 동안 카드에 담긴 요약을 먼저 보여주고 있습니다."
      : eventError
        ? `${eventError} 카드 기준 상세 정보를 먼저 보여주고 있습니다.`
        : "홈 카드와 검색 결과에 포함된 정보를 기준으로 상세 내용을 먼저 보여주고 있습니다."
    : isSummaryLoading
      ? "OpenAI가 요약을 생성하는 동안 규칙 기반 요약을 먼저 보여주고 있습니다."
      : aiSummary && summaryMeta
        ? `OpenAI ${summaryMeta.model} 응답으로 생성한 요약입니다.`
        : `${summaryError || "OpenAI 요약을 불러오지 못했습니다."} 규칙 기반 요약을 표시 중입니다.`;

  function handleToggleLike() {
    setIsLiked((current) => {
      const nextValue = !current;
      setActionMessage(nextValue ? "좋아요 표시를 남겼어요." : "좋아요 표시를 해제했어요.");
      return nextValue;
    });
  }

  function handleAddToCalendar() {
    if (!savedSchedule) {
      setActionMessage("캘린더에 추가할 수 있는 날짜 정보가 아직 부족합니다.");
      return;
    }

    if (isCalendarAdded) {
      setActionMessage("이미 내 일정에 저장해 두었어요.");
      return;
    }

    onSaveSchedule(savedSchedule);
    setActionMessage("상세 캘린더와 마이 페이지 내 일정에 표시했어요.");
  }

  async function handleCopyLink() {
    try {
      await copyText(resolvedSourceUrl);
      setIsLinkCopied(true);
      setActionMessage("해당 일정 링크를 복사했어요.");
    } catch {
      setActionMessage("링크 복사에 실패했어요. 다시 시도해 주세요.");
    }
  }

  return (
    <main className="page-shell">
      <section className="panel detail-hero-panel">
        <div className="detail-hero-panel__top">
          <button className="text-button" type="button" onClick={onBack}>
            {backLabel}
          </button>
          <span className="detail-page-badge">상세 정보</span>
        </div>

        <div className="detail-hero-panel__content">
          <div className="detail-hero-copy">
            <p className="hero-eyebrow">일정 상세</p>
            <h1 className="hero-title">{resolvedTitle}</h1>
            <p className="hero-description">
              홈 화면이나 상세 캘린더에서 선택한 정보를 기준으로 핵심 내용, 저장 액션, 공유 흐름을 한
              화면에서 정리했습니다.
            </p>
          </div>

          <div className="detail-hero-stats">
            <div className="hero-stat-card">
              <span>선택 키워드</span>
              <strong>{resolvedEntityName}</strong>
            </div>
            <div className="hero-stat-card">
              <span>정보 유형</span>
              <strong>{resolvedTypeLabel}</strong>
            </div>
            <div className="hero-stat-card">
              <span>출처 / 상태</span>
              <strong>{resolvedBadgeLabel}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <article className="panel detail-info-panel">
          <div className="detail-panel__header">
            <div>
              <p className="section-eyebrow">이벤트 정보</p>
              <h2 className="section-title">이벤트명 / 날짜 / 안내</h2>
            </div>
            <span className={`status-badge status-badge--${resolvedBadgeVariant}`}>
              {resolvedBadgeLabel}
            </span>
          </div>

          <dl className="detail-info-list">
            <div>
              <dt>이벤트명</dt>
              <dd>{resolvedTitle}</dd>
            </div>
            <div>
              <dt>날짜</dt>
              <dd>{formatDetailTimeRange(resolvedStartAt, resolvedEndAt)}</dd>
            </div>
            <div>
              <dt>안내</dt>
              <dd>{resolvedVenueGuide}</dd>
            </div>
          </dl>

          <div className="detail-status-row">
            <span className="tag-chip">#{resolvedEntityName}</span>
            {resolvedTags.map((tag) => (
              <span key={`${item.id}-${tag}`} className="tag-chip">
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
              {eventData ? (isSummaryLoading ? "생성 중" : aiSummary ? "OpenAI Live" : "Fallback") : "상세 정리"}
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
              {checklistItems.map((summaryItem) => (
                <div key={summaryItem.label} className="detail-checklist-row">
                  <strong>{summaryItem.label}</strong>
                  <span>{summaryItem.value}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="panel detail-action-panel">
          <div className="detail-panel__header">
            <p className="section-eyebrow">액션</p>
          </div>

          <div className="detail-action-primary">
            <button className="detail-primary-button" type="button" onClick={handleAddToCalendar}>
              {isCalendarAdded ? "내 일정에 저장됨" : "내 캘린더 추가"}
            </button>
            <span>저장한 일정은 상세 캘린더 날짜 표시와 마이 페이지의 내 일정 목록에 함께 반영됩니다.</span>
          </div>

          <div className="detail-action-grid">
            <button
              className={`detail-action-button${isLiked ? " is-active" : ""}`}
              type="button"
              onClick={handleToggleLike}
            >
              <strong>{isLiked ? "좋아요 완료" : "좋아요"}</strong>
              <span>중요 일정으로 표시해서 다시 보기 쉽게 남깁니다.</span>
            </button>
            <button
              className={`detail-action-button${isLinkCopied ? " is-active" : ""}`}
              type="button"
              onClick={() => void handleCopyLink()}
            >
              <strong>{isLinkCopied ? "링크 복사됨" : "공유"}</strong>
              <span>해당 일정 내용을 확인할 수 있는 링크를 복사합니다.</span>
            </button>
          </div>

          {actionMessage ? <div className="detail-action-feedback">{actionMessage}</div> : null}

          <div className="detail-link-card detail-link-card--last">
            <p className="section-eyebrow">외부 사이트 연결</p>
            <a href={resolvedSourceUrl} target="_blank" rel="noreferrer">
              {resolvedSourceName} 바로가기
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
