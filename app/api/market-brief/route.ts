import { NextRequest, NextResponse } from "next/server";
import { getMarketBrief, isMarketScope } from "@/lib/market-brief";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const scopeParam = request.nextUrl.searchParams.get("scope");
  const scope = isMarketScope(scopeParam) ? scopeParam : "global";
  const brief = await getMarketBrief(scope);

  return NextResponse.json(brief, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=300"
    }
  });
}
