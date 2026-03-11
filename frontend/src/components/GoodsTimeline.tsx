import { GOODS_RELEASE_LABELS } from "../constants/goods-options";
import { SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import type { GoodsItem } from "../types/goods";

interface GoodsTimelineProps {
  items: GoodsItem[];
  isLoading: boolean;
}

export function GoodsTimeline({ items, isLoading }: GoodsTimelineProps) {
  const timelineItems = items.slice(0, 6);

  return (
    <aside className="panel goods-timeline-panel">
      <div className="event-list-panel__header">
        <div>
          <p className="section-eyebrow">오픈 타임라인</p>
          <h2 className="section-title">곧 열리는 굿즈 일정</h2>
        </div>
        <span className="event-list-panel__count">{items.length}개 일정</span>
      </div>

      {isLoading ? <div className="state-box">굿즈 일정을 불러오는 중입니다.</div> : null}

      {!isLoading && !timelineItems.length ? (
        <div className="state-box state-box--empty">조건에 맞는 굿즈 일정이 없습니다.</div>
      ) : null}

      {!isLoading && timelineItems.length ? (
        <div className="goods-timeline-list">
          {timelineItems.map((item) => (
            <article key={item.id} className="goods-timeline-item">
              <div className="goods-timeline-item__header">
                <span className={`status-badge status-badge--${item.sourceType}`}>
                  {SOURCE_TYPE_LABELS[item.sourceType]}
                </span>
                <span className="category-badge">{GOODS_RELEASE_LABELS[item.releaseType]}</span>
              </div>
              <strong>{item.title}</strong>
              <p>{item.entityName}</p>
              <small>{formatEventTimeRange(item.startAt, item.endAt)}</small>
            </article>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
