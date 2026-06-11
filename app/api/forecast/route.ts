import { NextResponse } from "next/server";
import { forecastSeries } from "@/lib/analytics/forecast";
import { getDataset } from "@/lib/data/load";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    forecast: forecastSeries(getDataset().monthly_series, 6)
  });
}
