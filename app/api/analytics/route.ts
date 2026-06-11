import { NextResponse } from "next/server";
import { computeDistrictImpact, computeExecutiveMetrics, computeProgramPerformance } from "@/lib/analytics/metrics";
import { getDataset } from "@/lib/data/load";

export const dynamic = "force-static";

export async function GET() {
  const dataset = getDataset();
  return NextResponse.json({
    source: dataset.data_source,
    generated_at: dataset.generated_at,
    executive: computeExecutiveMetrics(dataset.records),
    districts: computeDistrictImpact(dataset),
    programs: computeProgramPerformance(dataset.records),
    monthly_series: dataset.monthly_series
  });
}
