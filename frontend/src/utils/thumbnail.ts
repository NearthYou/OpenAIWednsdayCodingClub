function hashString(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

const THUMBNAIL_GRADIENTS = [
  ["#ffe38b", "#ffb424", "#fff6d7"],
  ["#ffd8e8", "#ff9f43", "#fff2c9"],
  ["#cfe5ff", "#7cb7ff", "#fff8df"],
  ["#d8f7ec", "#79d2a6", "#fff4cf"],
  ["#eadbff", "#a87dff", "#fff6d7"]
] as const;

export function getThumbnailPresentation(primary: string, secondary: string) {
  const palette = THUMBNAIL_GRADIENTS[hashString(`${primary}-${secondary}`) % THUMBNAIL_GRADIENTS.length];
  const initials = primary
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  return {
    initials: initials || "DU",
    style: {
      background: `radial-gradient(circle at top left, rgba(255,255,255,0.72), transparent 42%), linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 58%, ${palette[2]} 100%)`
    }
  };
}
