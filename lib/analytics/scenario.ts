import type { InterventionRecord } from "@/lib/data/types";
import { computeProgramPerformance } from "./metrics";

export interface ScenarioResult {
  additionalBudget: number;
  additionalBeneficiaries: number;
  additionalOutcomes: number;
  additionalImpact: number;
  bestProgram: string;
  confidence: number;
}

export function simulateBudgetIncrease(records: InterventionRecord[], additionalBudget: number): ScenarioResult {
  const performance = computeProgramPerformance(records).filter((program) => program.costPerImpact > 0);
  const best = performance[0];
  const medianCostPerStudent = median(records.map((record) => record.program_cost));
  const additionalBeneficiaries = Math.floor(additionalBudget / medianCostPerStudent);
  const additionalImpact = best ? Math.floor(additionalBudget / best.costPerImpact) : 0;
  const avgOutcomeGain =
    performance.length === 0
      ? 0
      : performance.reduce((total, program) => total + program.avgGain, 0) / performance.length;

  return {
    additionalBudget,
    additionalBeneficiaries,
    additionalOutcomes: Math.round(additionalBeneficiaries * Math.max(avgOutcomeGain, 0)),
    additionalImpact,
    bestProgram: best?.program ?? "Teaching at the Right Level",
    confidence: 0.78
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
