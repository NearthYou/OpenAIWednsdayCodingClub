import { CATEGORY_LABELS, SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import { getKeywordImage } from "../utils/keyword-images";
import { getThumbnailPresentation } from "../utils/thumbnail";
import type { EventItem } from "../types/event";

interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const thumbnail = getThumbnailPresentation(event.entityName, event.category);
  const previewImage = getKeywordImage(event.entityName);
  const visibleTags = event.tags.slice(0, 2);

  return (
    <article className={["event-card", onSelect ? "is-interactive" : ""].filter(Boolean).join(" ")}>
      <div className="card-thumbnail event-card__thumbnail" style={thumbnail.style}>
        <div className="card-thumbnail__overlay">
          <span className="card-thumbnail__eyebrow">{event.entityName}</span>
          {previewImage ? (
            <div className="card-thumbnail__visual" aria-hidden="true">
              <div className="card-thumbnail__preview-shell">
                <img className="card-thumbnail__preview" src={previewImage} alt="" loading="lazy" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="event-card__meta">
        <span className={`status-badge status-badge--${event.sourceType}`}>
          {SOURCE_TYPE_LABELS[event.sourceType]}
        </span>
        <span className="category-badge">{CATEGORY_LABELS[event.category]}</span>
      </div>

      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
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
        {visibleTags.map((tag) => (
          <span key={`${event.id}-${tag}`} className="tag-chip">
            #{tag}
          </span>
        ))}
        {event.tags.length > visibleTags.length ? (
          <span className="tag-chip">+{event.tags.length - visibleTags.length}</span>
        ) : null}
      </div>

      {onSelect ? (
        <div className="event-card__footer">
          <button
            className="text-button event-card__button"
            type="button"
            onClick={() => onSelect(event)}
          >
            AI 요약 보기
          </button>
        </div>
      ) : null}
    </article>
  );
}
