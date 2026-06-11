import analytics from "@/data/processed/analytics.json";
import type { AnalyticsDataset } from "./types";

export function getDataset(): AnalyticsDataset {
  return analytics as AnalyticsDataset;
}
