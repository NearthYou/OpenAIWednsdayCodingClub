export const currencyFormatter = (currency: string | null) =>
  new Intl.NumberFormat("ko-KR", {
    style: currency ? "currency" : "decimal",
    currency: currency ?? "USD",
    maximumFractionDigits: 2,
  });

export const percentFormatter = new Intl.NumberFormat("ko-KR", {
  style: "percent",
  signDisplay: "always",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const compactDateTime = (value: string | null) => {
  if (!value) {
    return "날짜 정보 없음";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
