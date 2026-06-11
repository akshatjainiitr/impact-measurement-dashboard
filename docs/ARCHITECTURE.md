# Architecture

## System Diagram

```mermaid
flowchart TD
  A["ASER 2024 district estimate PDFs"] --> B["scripts/acquire_aser_data.py"]
  B --> C["data/processed/aser_district_benchmarks.csv"]
  C --> D["scripts/etl.py"]
  D --> E["data/processed/analytics.json"]
  D --> F["data/processed/seed_records.json"]
  F --> G["Prisma seed"]
  G --> H["PostgreSQL"]
  E --> I["Next.js API routes"]
  H --> I
  I --> J["ImpactLens dashboard"]
  J --> K["Executive, M&E, Program, Fundraising users"]
```

## Runtime Design

- The dashboard can run from processed JSON for static demos and Vercel previews.
- Prisma/PostgreSQL provides the production persistence model.
- API routes expose analytics, data quality, insights, scenarios, forecast, and seed inspection.
- AI insight generation has an OpenAI-compatible adapter with deterministic fallback.

## ER Diagram

```mermaid
erDiagram
  STUDENT_INTERVENTIONS {
    string student_id PK
    string district
    string state
    enum gender
    int age
    enum school_type
    decimal attendance_percentage
    decimal baseline_reading_score
    decimal endline_reading_score
    decimal baseline_math_score
    decimal endline_math_score
    enum program_type
    date program_start_date
    date program_end_date
    decimal program_cost
    string field_worker
    date assessment_date
  }

  DISTRICT_BENCHMARKS {
    string state
    string district
    decimal govt_school_enrollment_pct
    decimal not_enrolled_pct
    decimal std3_5_reading_pct
    decimal std3_5_subtraction_pct
    string source_url
  }

  DATA_QUALITY_RUNS {
    datetime generated_at
    int total_records
    int missing_values
    int duplicate_records
    int invalid_entries
    int outliers
    decimal quality_score
    json issue_json
  }

  MONTHLY_IMPACT_METRICS {
    date month
    decimal impact_score
    int enrollment
    int competency_achievement
    decimal cost
  }

  DISTRICT_BENCHMARKS ||--o{ STUDENT_INTERVENTIONS : calibrates
  STUDENT_INTERVENTIONS ||--o{ MONTHLY_IMPACT_METRICS : aggregates
  STUDENT_INTERVENTIONS ||--o{ DATA_QUALITY_RUNS : validates
```

