import { NextResponse } from "next/server";

import { buildSearchResult } from "@/lib/search-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q");
  const result = await buildSearchResult(query);

  return NextResponse.json(result);
}
