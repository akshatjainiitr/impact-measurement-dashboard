export type Gender = "Girl" | "Boy" | "Non-binary";
export type SchoolType = "Government" | "Government-aided" | "Private low-fee";
export type ProgramType =
  | "Teaching at the Right Level"
  | "Mother Tongue Reading Camp"
  | "Foundational Math Lab"
  | "Digital Practice Circle"
  | "Remedial Bridge Course";

export interface InterventionRecord {
  student_id: string;
  district: string;
  state: string;
  gender: Gender;
  age: number;
  school_type: SchoolType;
  attendance_percentage: number;
  baseline_reading_score: number;
  endline_reading_score: number;
  baseline_math_score: number;
  endline_math_score: number;
  program_type: ProgramType;
  program_start_date: string;
  program_end_date: string;
  program_cost: number;
  field_worker: string;
  assessment_date: string;
  source_reading_competency_rate: number;
  source_math_competency_rate: number;
}

export interface DistrictBenchmark {
  district: string;
  state: string;
  govt_school_enrollment_pct: number;
  not_enrolled_pct: number;
  std3_5_reading_pct: number;
  std3_5_subtraction_pct: number;
  std6_8_reading_pct: number;
  std6_8_division_pct: number;
  source_url: string;
}

export interface DataQualityIssue {
  type: "missing" | "duplicate" | "invalid" | "outlier";
  field: string;
  count: number;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface DataQualitySummary {
  total_records: number;
  missing_values: number;
  duplicate_records: number;
  invalid_entries: number;
  outliers: number;
  quality_score: number;
  issues: DataQualityIssue[];
}

export interface MonthlySeriesPoint {
  month: string;
  impact_score: number;
  enrollment: number;
  competency_achievement: number;
  cost: number;
}

export interface AnalyticsDataset {
  generated_at: string;
  data_source: {
    name: string;
    url: string;
    access_note: string;
  };
  records: InterventionRecord[];
  district_benchmarks: DistrictBenchmark[];
  quality: DataQualitySummary;
  monthly_series: MonthlySeriesPoint[];
}

export interface ExecutiveMetrics {
  impactEfficiencyScore: number;
  costPerImpact: number;
  beneficiariesReached: number;
  programCompletionRate: number;
  learningImprovementPct: number;
  activePrograms: number;
  studentsAchievingCompetency: number;
  totalProgramCost: number;
}

export interface DistrictImpact {
  district: string;
  state: string;
  impactScore: number;
  readingImprovement: number;
  mathImprovement: number;
  costPerImpact: number;
  students: number;
  competencyRate: number;
  lat: number;
  lng: number;
}
