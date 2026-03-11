import { GOODS_PICKUP_LABELS, GOODS_RELEASE_LABELS } from "../constants/goods-options";
import { SOURCE_TYPE_LABELS } from "../constants/filter-options";
import { formatCompactEventTimeRange } from "../utils/date";
import { getGoodsPhotoPresentation } from "../utils/goods-media";
import { getKeywordImage } from "../utils/keyword-images";
import { getThumbnailPresentation } from "../utils/thumbnail";
import type { GoodsItem } from "../types/goods";

interface GoodsReleaseCardProps {
  item: GoodsItem;
}

export function GoodsReleaseCard({ item }: GoodsReleaseCardProps) {
  const visibleTags = item.tags.slice(0, 1);
  const hiddenTagCount = Math.max(0, item.tags.length - visibleTags.length);
  const thumbnail = getThumbnailPresentation(item.entityName, item.releaseType);
  const photo = getGoodsPhotoPresentation(item);
  const previewImage = photo ? null : getKeywordImage(item.entityName);
  const thumbnailClassName = `card-thumbnail goods-card__thumbnail${photo ? " card-thumbnail--photo" : ""}`;

  return (
    <article className="goods-card">
      <div className={thumbnailClassName} style={thumbnail.style}>
        {photo ? (
          <img
            className="card-thumbnail__image"
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            style={{ objectPosition: photo.objectPosition }}
          />
        ) : null}
        <div className="card-thumbnail__overlay">
          {!photo && previewImage ? (
            <div className="card-thumbnail__visual goods-card__thumbnail-visual" aria-hidden="true">
              <div className="card-thumbnail__preview-shell goods-card__preview-shell">
                <img className="card-thumbnail__preview" src={previewImage} alt="" loading="lazy" />
              </div>
            </div>
          ) : (
            <span className="card-thumbnail__eyebrow goods-card__eyebrow-pill">{item.entityName}</span>
          )}
          <span className="category-badge goods-card__thumbnail-badge">
            {GOODS_RELEASE_LABELS[item.releaseType]}
          </span>
        </div>
      </div>

      <div className="goods-card__meta">
        <span className={`status-badge status-badge--${item.sourceType}`}>
          {SOURCE_TYPE_LABELS[item.sourceType]}
        </span>
        <span className="category-badge">{GOODS_RELEASE_LABELS[item.releaseType]}</span>
      </div>

      <div className="goods-card__content">
        <h3 className="goods-card__title">{item.title}</h3>
        <p className="goods-card__spotlight">{item.spotlight}</p>
      </div>

      <div className="goods-card__facts">
        <div className="goods-card__fact-row">
          <span className="goods-card__fact">
            <strong>일정</strong>
            <span className="goods-card__fact-value">
              {formatCompactEventTimeRange(item.startAt, item.endAt)}
            </span>
          </span>
          <span className="goods-card__fact">
            <strong>가격</strong>
            <span className="goods-card__fact-value">{item.priceLabel}</span>
          </span>
        </div>
        <div className="goods-card__fact-row">
          <span className="goods-card__fact">
            <strong>판매처</strong>
            <a
              className="goods-card__fact-value"
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {item.vendorName}
            </a>
          </span>
          <span className="goods-card__fact">
            <strong>수령</strong>
            <span className="goods-card__fact-value">{GOODS_PICKUP_LABELS[item.pickupMode]}</span>
          </span>
        </div>
      </div>

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
