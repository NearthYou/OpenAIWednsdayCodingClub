import goodsInfiniteImage from "../assets/goods-infinite.jpg";
import goodsIveImage from "../assets/goods-ive.jpg";
import goodsMikuImage from "../assets/goods-miku.png";
import goodsVixxBookImage from "../assets/goods-vixx-book.jpg";
import goodsVixxImage from "../assets/goods-vixx.jpg";
import type { GoodsItem } from "../types/goods";

interface GoodsPhotoPresentation {
  src: string;
  alt: string;
  objectPosition?: string;
}

const goodsPhotoMap: Record<string, GoodsPhotoPresentation> = {
  "goods-miku-spring-drop-2026-03-14": {
    src: goodsMikuImage,
    alt: "하츠네 미쿠 굿즈 예시 사진",
    objectPosition: "center 34%"
  },
  "goods-ive-fancon-package-2026-03-18": {
    src: goodsIveImage,
    alt: "아이브 굿즈 예시 사진",
    objectPosition: "center 26%"
  },
  "goods-infinite-tour-md-2026-05-20": {
    src: goodsInfiniteImage,
    alt: "인피니트 투어 MD 예시 사진",
    objectPosition: "center 18%"
  },
  "goods-infinite-fan-kit-2026-06-10": {
    src: goodsInfiniteImage,
    alt: "인피니트 팬 키트 예시 사진",
    objectPosition: "center 18%"
  },
  "goods-vixx-anniversary-set-2026-04-16": {
    src: goodsVixxBookImage,
    alt: "빅스 포토북 세트 예시 사진",
    objectPosition: "center 46%"
  },
  "goods-vixx-lightstick-rumor-2026-07-10": {
    src: goodsVixxImage,
    alt: "빅스 응원봉 예시 사진",
    objectPosition: "center 24%"
  }
};

export function getGoodsPhotoPresentation(item: GoodsItem) {
  return goodsPhotoMap[item.id] ?? null;
}
