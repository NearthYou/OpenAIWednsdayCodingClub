import { EventCard } from "./EventCard";
import { formatDateLabel } from "../utils/date";
import type { EventItem } from "../types/event";

interface EventListProps {
  selectedDate: string;
  events: EventItem[];
  isLoading: boolean;
  onEventSelect: (event: EventItem) => void;
}

export function EventList({ selectedDate, events, isLoading, onEventSelect }: EventListProps) {
  return (
    <aside className="panel event-list-panel">
      <div className="event-list-panel__header">
        <div>
          <p className="section-eyebrow">선택 날짜 일정</p>
          <h2 className="section-title">{formatDateLabel(selectedDate)}</h2>
          <p className="section-helper">카드의 상세 보기 버튼으로 3번 페이지에 진입할 수 있습니다.</p>
        </div>
        <span className="event-list-panel__count">{events.length}개 일정</span>
      </div>

      {isLoading ? <div className="state-box">일정을 불러오는 중입니다.</div> : null}

      {!isLoading && !events.length ? (
        <div className="state-box state-box--empty">
          선택한 날짜에는 조건에 맞는 일정이 없습니다.
        </div>
      ) : null}

      {!isLoading && events.length ? (
        <div className="event-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onSelect={onEventSelect} />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
