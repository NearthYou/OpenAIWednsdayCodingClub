import { GOODS_PICKUP_LABELS, GOODS_RELEASE_LABELS } from "../constants/goods-options";
import { SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatEventTimeRange } from "../utils/date";
import type { GoodsItem } from "../types/goods";

interface GoodsReleaseCardProps {
  item: GoodsItem;
}

export function GoodsReleaseCard({ item }: GoodsReleaseCardProps) {
  const visibleTags = item.tags.slice(0, 2);
  const hiddenTagCount = Math.max(0, item.tags.length - visibleTags.length);

  return (
    <article className="goods-card">
      <div className="goods-card__meta">
        <span className={`status-badge status-badge--${item.sourceType}`}>
          {SOURCE_TYPE_LABELS[item.sourceType]}
        </span>
        <span className="category-badge">{GOODS_RELEASE_LABELS[item.releaseType]}</span>
      </div>

      <div className="goods-card__content">
        <p className="goods-card__eyebrow">{item.entityName}</p>
        <h3 className="goods-card__title">{item.title}</h3>
        <p className="goods-card__spotlight">{item.spotlight}</p>
      </div>

      <dl className="goods-card__details">
        <div>
          <dt>오픈 일정</dt>
          <dd>{formatEventTimeRange(item.startAt, item.endAt)}</dd>
        </div>
        <div>
          <dt>판매처</dt>
          <dd>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              {item.vendorName}
            </a>
          </dd>
        </div>
        <div>
          <dt>가격대</dt>
          <dd>{item.priceLabel}</dd>
        </div>
        <div>
          <dt>수령 방식</dt>
          <dd>{GOODS_PICKUP_LABELS[item.pickupMode]}</dd>
        </div>
      </dl>

      <div className="goods-card__stock-note">{item.stockNote}</div>

      <div className="tag-list">
        <span className="tag-chip">#{item.sourceName}</span>
        {visibleTags.map((tag) => (
          <span key={`${item.id}-${tag}`} className="tag-chip">
            #{tag}
          </span>
        ))}
        {hiddenTagCount > 0 ? <span className="tag-chip">+{hiddenTagCount}</span> : null}
      </div>
    </article>
  );
}
