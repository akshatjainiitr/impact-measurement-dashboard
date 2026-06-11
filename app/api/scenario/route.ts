import { NextRequest, NextResponse } from "next/server";
import { simulateBudgetIncrease } from "@/lib/analytics/scenario";
import { getDataset } from "@/lib/data/load";

export async function GET(request: NextRequest) {
  const budget = Number(request.nextUrl.searchParams.get("budget") ?? 500000);
  return NextResponse.json(simulateBudgetIncrease(getDataset().records, budget));
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { budget?: number };
  return NextResponse.json(simulateBudgetIncrease(getDataset().records, Number(body.budget ?? 500000)));
}
