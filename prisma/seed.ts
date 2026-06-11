import { PrismaClient } from "@prisma/client";
import analytics from "../data/processed/analytics.json";

const prisma = new PrismaClient();

const programMap = {
  "Teaching at the Right Level": "TeachingAtTheRightLevel",
  "Mother Tongue Reading Camp": "MotherTongueReadingCamp",
  "Foundational Math Lab": "FoundationalMathLab",
  "Digital Practice Circle": "DigitalPracticeCircle",
  "Remedial Bridge Course": "RemedialBridgeCourse"
} as const;

const schoolMap = {
  Government: "Government",
  "Government-aided": "GovernmentAided",
  "Private low-fee": "PrivateLowFee"
} as const;

async function main() {
  await prisma.studentIntervention.deleteMany();
  await prisma.districtBenchmark.deleteMany();
  await prisma.monthlyImpactMetric.deleteMany();
  await prisma.dataQualityRun.deleteMany();

  await prisma.districtBenchmark.createMany({
    data: analytics.district_benchmarks.map((row) => ({
      state: row.state,
      district: row.district,
      govtSchoolEnrollmentPct: row.govt_school_enrollment_pct,
      notEnrolledPct: row.not_enrolled_pct,
      std35ReadingPct: row.std3_5_reading_pct,
      std35SubtractionPct: row.std3_5_subtraction_pct,
      std68ReadingPct: row.std6_8_reading_pct,
      std68DivisionPct: row.std6_8_division_pct,
      sourceUrl: row.source_url
    }))
  });

  for (const record of analytics.records) {
    await prisma.studentIntervention.create({
      data: {
        studentId: record.student_id,
        district: record.district,
        state: record.state,
        gender:
  record.gender === "Male"
    ? "Boy"
    : record.gender === "Female"
    ? "Girl"
    : "NonBinary",
        age: record.age,
        schoolType: schoolMap[record.school_type as keyof typeof schoolMap],
        attendancePercentage: record.attendance_percentage,
        baselineReadingScore: record.baseline_reading_score,
        endlineReadingScore: record.endline_reading_score,
        baselineMathScore: record.baseline_math_score,
        endlineMathScore: record.endline_math_score,
        programType: programMap[record.program_type as keyof typeof programMap],
        programStartDate: new Date(record.program_start_date),
        programEndDate: new Date(record.program_end_date),
        programCost: record.program_cost,
        fieldWorker: record.field_worker,
        assessmentDate: new Date(record.assessment_date),
        sourceReadingCompetencyRate: record.source_reading_competency_rate,
        sourceMathCompetencyRate: record.source_math_competency_rate
      }
    });
  }

  await prisma.monthlyImpactMetric.createMany({
    data: analytics.monthly_series.map((row) => ({
      month: new Date(`${row.month}-01T00:00:00.000Z`),
      impactScore: row.impact_score,
      enrollment: row.enrollment,
      competencyAchievement: row.competency_achievement,
      cost: row.cost
    }))
  });

  await prisma.dataQualityRun.create({
    data: {
      generatedAt: new Date(analytics.generated_at),
      totalRecords: analytics.quality.total_records,
      missingValues: analytics.quality.missing_values,
      duplicateRecords: analytics.quality.duplicate_records,
      invalidEntries: analytics.quality.invalid_entries,
      outliers: analytics.quality.outliers,
      qualityScore: analytics.quality.quality_score,
      issueJson: analytics.quality.issues
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
