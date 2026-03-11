import { NextResponse } from "next/server";
import { getIndexSeries } from "@/lib/index-history";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getIndexSeries();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=3600"
      }
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch index history"
      },
      {
        status: 500
      }
    );
  }
}
