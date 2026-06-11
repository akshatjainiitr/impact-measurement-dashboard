import { NextResponse } from "next/server";
import { getDataset } from "@/lib/data/load";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(getDataset().quality);
}
