import type { GoodsPickupMode, GoodsReleaseType } from "../types/goods";

export const GOODS_RELEASE_OPTIONS: Array<{ value: GoodsReleaseType; label: string }> = [
  { value: "reservation", label: "예약 판매" },
  { value: "onsite", label: "현장 판매" },
  { value: "lottery", label: "추첨 판매" },
  { value: "restock", label: "재입고" }
];

export const GOODS_RELEASE_LABELS: Record<GoodsReleaseType, string> = {
  reservation: "예약 판매",
  onsite: "현장 판매",
  lottery: "추첨 판매",
  restock: "재입고"
};

export const GOODS_PICKUP_LABELS: Record<GoodsPickupMode, string> = {
  shipping: "택배 배송",
  onsite: "현장 수령",
  mixed: "배송 + 수령"
};
