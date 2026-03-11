import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { app } = require("../backend/src/app");

function buildApiUrl(requestUrl) {
  const url = new URL(requestUrl, "https://vercel.internal");
  const rawPath = url.searchParams.get("path") || "";

  url.searchParams.delete("path");

  const normalizedPath = rawPath ? `/${rawPath}` : "";
  const nextQuery = url.searchParams.toString();

  return `/api${normalizedPath}${nextQuery ? `?${nextQuery}` : ""}`;
}

export default function handler(request, response) {
  request.url = buildApiUrl(request.url || "/api");
  return app(request, response);
}
