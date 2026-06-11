import { NextResponse } from "next/server";
import { getDataset } from "@/lib/data/load";

export const dynamic = "force-static";

export async function GET() {
  const dataset = getDataset();
  return NextResponse.json({
    records: dataset.records.slice(0, 50),
    total_records: dataset.records.length,
    note: "First 50 seed records are returned for inspection. Full seed data is in data/processed/seed_records.json."
  });
}
