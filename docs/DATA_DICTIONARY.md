# Data Dictionary

## `StudentIntervention`

| Field | Type | Description |
| --- | --- | --- |
| `student_id` | string | Stable NGO learner identifier |
| `district` | string | District where learner received intervention |
| `state` | string | Indian state |
| `gender` | enum | `Girl`, `Boy`, or `Non-binary` |
| `age` | integer | Learner age, validated from 6 to 14 |
| `school_type` | enum | Government, government-aided, or private low-fee |
| `attendance_percentage` | decimal | Program attendance from 0 to 100 |
| `baseline_reading_score` | decimal | Reading score before intervention |
| `endline_reading_score` | decimal | Reading score after intervention |
| `baseline_math_score` | decimal | Math score before intervention |
| `endline_math_score` | decimal | Math score after intervention |
| `program_type` | enum | Intervention model delivered |
| `program_start_date` | date | Intervention start |
| `program_end_date` | date | Intervention end |
| `program_cost` | decimal | Learner-level allocated cost in INR |
| `field_worker` | string | Field worker responsible for implementation |
| `assessment_date` | date | Endline assessment date |
| `source_reading_competency_rate` | decimal | ASER district reading benchmark used for calibration |
| `source_math_competency_rate` | decimal | ASER district arithmetic benchmark used for calibration |

## `DistrictBenchmark`

District-level public ASER 2024 indicators extracted from district-estimate PDFs.

| Field | Description |
| --- | --- |
| `govt_school_enrollment_pct` | % children age 6-14 enrolled in government schools |
| `not_enrolled_pct` | % children age 6-14 not enrolled in school |
| `std3_5_reading_pct` | % Std III-V children who can read Std II text |
| `std3_5_subtraction_pct` | % Std III-V children who can do subtraction |
| `std6_8_reading_pct` | % Std VI-VIII children who can read Std II text |
| `std6_8_division_pct` | % Std VI-VIII children who can do division |
| `source_url` | ASER PDF URL |

## Data Quality Rules

- Required fields are filled or excluded according to type.
- Duplicate records are detected by `student_id`.
- Ages must be 6-14.
- Scores and attendance must be 0-100.
- Program end date must be on or after start date.
- Extreme numeric values are detected by z-score and winsorized.

