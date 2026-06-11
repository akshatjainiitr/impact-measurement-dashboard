import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json",
  "eslint.config.mjs",
  "app/page.tsx",
  "app/api/analytics/route.ts",
  "prisma/schema.prisma",
  "scripts/acquire_aser_data.py",
  "scripts/etl.py",
  "data/processed/analytics.json",
  "docs/DATA_DICTIONARY.md",
  "docs/KPI_DOCUMENTATION.md",
  "docs/API.md",
  "docs/USER_GUIDE.md",
  "docs/ARCHITECTURE.md",
  "docs/EVALUATION_CHECKLIST.md",
  "docs/FOLDER_STRUCTURE.md",
  "Dockerfile",
  "vercel.json"
];

let failures = 0;
for (const file of required) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    console.error(`missing ${file}`);
    failures += 1;
  }
}

const analyticsPath = path.join(root, "data/processed/analytics.json");
if (fs.existsSync(analyticsPath)) {
  const analytics = JSON.parse(fs.readFileSync(analyticsPath, "utf8"));
  const fields = [
    "student_id",
    "district",
    "state",
    "gender",
    "age",
    "school_type",
    "attendance_percentage",
    "baseline_reading_score",
    "endline_reading_score",
    "baseline_math_score",
    "endline_math_score",
    "program_type",
    "program_start_date",
    "program_end_date",
    "program_cost",
    "field_worker",
    "assessment_date"
  ];
  if (!Array.isArray(analytics.records) || analytics.records.length < 800) {
    console.error("analytics.records must contain at least 800 intervention records");
    failures += 1;
  }
  for (const field of fields) {
    if (!(field in analytics.records[0])) {
      console.error(`missing required record field ${field}`);
      failures += 1;
    }
  }
  if (!analytics.quality || analytics.quality.quality_score < 90) {
    console.error("data quality score should be >= 90 for demo readiness");
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("ImpactLens local validation passed.");
