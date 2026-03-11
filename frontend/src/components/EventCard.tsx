import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import type { EventItem } from "../types/event";

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__meta">
        <span className={`status-badge status-badge--${event.sourceType}`}>
          {SOURCE_TYPE_LABELS[event.sourceType]}
        </span>
        <span className="category-badge">{CATEGORY_LABELS[event.category]}</span>
      </div>

      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__entity">{event.entityName}</p>
      </div>

      <dl className="event-card__details">
        <div>
          <dt>날짜</dt>
          <dd>{formatEventTimeRange(event.startAt, event.endAt)}</dd>
        </div>
        <div>
          <dt>출처</dt>
          <dd>
            <a href={event.sourceUrl} target="_blank" rel="noreferrer">
              {event.sourceName}
            </a>
          </dd>
        </div>
      </dl>

      <div className="tag-list">
        {event.tags.map((tag) => (
          <span key={`${event.id}-${tag}`} className="tag-chip">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
