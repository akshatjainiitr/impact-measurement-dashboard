import type { AnalyticsDataset } from "@/lib/data/types";
import {
  ageGroups,
  breakdown,
  computeDistrictImpact,
  computeExecutiveMetrics,
  computeProgramPerformance
} from "./metrics";

export interface Insight {
  title: string;
  body: string;
  priority: "Executive" | "Program" | "Equity" | "Data";
  confidence: number;
}

export function generateDeterministicInsights(dataset: AnalyticsDataset): Insight[] {
  const metrics = computeExecutiveMetrics(dataset.records);
  const districts = computeDistrictImpact(dataset).sort((a, b) => b.impactScore - a.impactScore);
  const programs = computeProgramPerformance(dataset.records);
  const genders = breakdown(dataset.records, "gender").sort((a, b) => b.competencyRate - a.competencyRate);
  const ages = ageGroups(dataset.records).sort((a, b) => a.competencyRate - b.competencyRate);
  const latest = dataset.monthly_series[dataset.monthly_series.length - 1];
  const previous = dataset.monthly_series[dataset.monthly_series.length - 2];
  const monthlyChange =
    previous.impact_score === 0 ? 0 : (latest.impact_score - previous.impact_score) / previous.impact_score;

  return [
    {
      title: "Monday focus",
      body: `Impact Efficiency Score is ${(metrics.impactEfficiencyScore * 100000).toFixed(
        2
      )} competency achievements per Rs. 1 lakh. The fastest executive lever is reallocating the next flexible rupee toward ${programs[0]?.program}.`,
      priority: "Executive",
      confidence: 0.86
    },
    {
      title: `${districts[0]?.district} is the current proof point`,
      body: `${districts[0]?.district}, ${districts[0]?.state} leads with an impact score of ${districts[0]?.impactScore}. Its combined reading and math gains are ${(
        districts[0]?.readingImprovement + districts[0]?.mathImprovement
      ).toFixed(1)} points.`,
      priority: "Program",
      confidence: 0.82
    },
    {
      title: `${districts[districts.length - 1]?.district} needs field attention`,
      body: `${districts[districts.length - 1]?.district} has the weakest district impact score at ${
        districts[districts.length - 1]?.impactScore
      }. Review attendance, field-worker caseload, and whether the program mix matches local ASER learning levels.`,
      priority: "Program",
      confidence: 0.81
    },
    {
      title: "Gender equity check",
      body: `${genders[0]?.name} learners outperform ${genders[genders.length - 1]?.name} learners by ${Math.abs(
        (genders[0]?.competencyRate - genders[genders.length - 1]?.competencyRate) * 100
      ).toFixed(1)} percentage points on competency achievement.`,
      priority: "Equity",
      confidence: 0.76
    },
    {
      title: "Impact momentum",
      body: `Impact score changed ${(monthlyChange * 100).toFixed(1)}% month over month in ${
        latest.month
      }, with ${latest.competency_achievement} learners reaching competency.`,
      priority: "Executive",
      confidence: 0.74
    },
    {
      title: "Younger learners are underserved",
      body: `The ${ages[0]?.name} age group has the lowest competency rate at ${(ages[0]?.competencyRate * 100).toFixed(
        1
      )}%. Prioritize parent engagement and more frequent formative assessments for this group.`,
      priority: "Equity",
      confidence: 0.72
    },
    {
      title: "Data quality is board-ready",
      body: `The processed dataset quality score is ${dataset.quality.quality_score}/100 after missing-value handling, duplicate detection, validation checks, and outlier review.`,
      priority: "Data",
      confidence: 0.9
    }
  ];
}
