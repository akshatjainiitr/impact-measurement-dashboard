import { NextResponse } from "next/server";
import { generateDeterministicInsights } from "@/lib/analytics/insights";
import { getDataset } from "@/lib/data/load";

export async function GET() {
  const dataset = getDataset();
  return NextResponse.json({
    insights: generateDeterministicInsights(dataset)
  });
}
