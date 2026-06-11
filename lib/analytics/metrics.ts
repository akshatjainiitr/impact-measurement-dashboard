import type {
  AnalyticsDataset,
  DistrictImpact,
  ExecutiveMetrics,
  InterventionRecord
} from "@/lib/data/types";

export const COMPETENCY_SCORE = 70;

export function hasReachedCompetency(record: InterventionRecord) {
  return (
    record.endline_reading_score >= COMPETENCY_SCORE &&
    record.endline_math_score >= COMPETENCY_SCORE
  );
}

export function computeExecutiveMetrics(records: InterventionRecord[]): ExecutiveMetrics {
  const totalProgramCost = sum(records.map((record) => record.program_cost));
  const studentsAchievingCompetency = records.filter(hasReachedCompetency).length;
  const completed = records.filter(
    (record) => new Date(record.program_end_date).getTime() <= new Date(record.assessment_date).getTime()
  ).length;
  const avgBaseline = average(
    records.map((record) => (record.baseline_reading_score + record.baseline_math_score) / 2)
  );
  const avgEndline = average(
    records.map((record) => (record.endline_reading_score + record.endline_math_score) / 2)
  );
  const activePrograms = new Set(records.map((record) => record.program_type)).size;

  return {
    impactEfficiencyScore: totalProgramCost === 0 ? 0 : studentsAchievingCompetency / totalProgramCost,
    costPerImpact:
      studentsAchievingCompetency === 0 ? 0 : totalProgramCost / studentsAchievingCompetency,
    beneficiariesReached: records.length,
    programCompletionRate: records.length === 0 ? 0 : completed / records.length,
    learningImprovementPct: avgBaseline === 0 ? 0 : (avgEndline - avgBaseline) / avgBaseline,
    activePrograms,
    studentsAchievingCompetency,
    totalProgramCost
  };
}

export function computeDistrictImpact(dataset: AnalyticsDataset): DistrictImpact[] {
  const coordinates: Record<string, [number, number]> = {
    Araria: [26.1, 87.5],
    Patna: [25.6, 85.1],
    Gaya: [24.8, 85.0],
    Purnia: [25.8, 87.5],
    Satara: [17.7, 74.0],
    Pune: [18.5, 73.8],
    Nandurbar: [21.4, 74.2],
    Nagpur: [21.1, 79.1],
    Jaipur: [26.9, 75.8],
    Banswara: [23.5, 74.4],
    Udaipur: [24.6, 73.7],
    Churu: [28.3, 74.9],
    Bahraich: [27.6, 81.6],
    Lucknow: [26.8, 80.9],
    Varanasi: [25.3, 82.9],
    Agra: [27.2, 78.0],
    Ghaziabad: [28.7, 77.4],
    Sitamarhi: [26.6, 85.5],
    Rohtas: [24.9, 84.0],
    Sindhudurg: [16.0, 73.7]
  };

  return groupBy(dataset.records, (record) => `${record.state}:${record.district}`).map((group) => {
    const records = group.items;
    const readingImprovement = average(
      records.map((record) => record.endline_reading_score - record.baseline_reading_score)
    );
    const mathImprovement = average(
      records.map((record) => record.endline_math_score - record.baseline_math_score)
    );
    const competency = records.filter(hasReachedCompetency).length;
    const cost = sum(records.map((record) => record.program_cost));
    const competencyRate = records.length === 0 ? 0 : competency / records.length;
    const impactScore = Math.round(
      competencyRate * 52 + Math.max(readingImprovement, 0) * 0.9 + Math.max(mathImprovement, 0) * 0.9
    );
    const sample = records[0];
    const coord = coordinates[sample.district] ?? [22.8, 79.8];

    return {
      district: sample.district,
      state: sample.state,
      impactScore,
      readingImprovement,
      mathImprovement,
      costPerImpact: competency === 0 ? 0 : cost / competency,
      students: records.length,
      competencyRate,
      lat: coord[0],
      lng: coord[1]
    };
  });
}

export function computeProgramPerformance(records: InterventionRecord[]) {
  return groupBy(records, (record) => record.program_type)
    .map((group) => {
      const competency = group.items.filter(hasReachedCompetency).length;
      const cost = sum(group.items.map((record) => record.program_cost));
      const avgGain = average(
        group.items.map(
          (record) =>
            (record.endline_reading_score +
              record.endline_math_score -
              record.baseline_reading_score -
              record.baseline_math_score) /
            2
        )
      );
      return {
        program: group.key,
        students: group.items.length,
        competency,
        cost,
        costPerImpact: competency === 0 ? 0 : cost / competency,
        avgGain
      };
    })
    .sort((a, b) => a.costPerImpact - b.costPerImpact);
}

export function breakdown(records: InterventionRecord[], key: keyof InterventionRecord) {
  return groupBy(records, (record) => String(record[key])).map((group) => ({
    name: group.key,
    value: group.items.length,
    competencyRate: group.items.filter(hasReachedCompetency).length / group.items.length,
    readingGain: average(
      group.items.map((record) => record.endline_reading_score - record.baseline_reading_score)
    ),
    mathGain: average(group.items.map((record) => record.endline_math_score - record.baseline_math_score))
  }));
}

export function ageGroups(records: InterventionRecord[]) {
  const groups = records.map((record) => ({
    ...record,
    age_group: record.age <= 8 ? "6-8" : record.age <= 11 ? "9-11" : "12-14"
  }));
  return groupBy(groups, (record) => record.age_group).map((group) => ({
    name: group.key,
    value: group.items.length,
    competencyRate: group.items.filter(hasReachedCompetency).length / group.items.length
  }));
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });
  return [...map.entries()].map(([key, groupItems]) => ({ key, items: groupItems }));
}
