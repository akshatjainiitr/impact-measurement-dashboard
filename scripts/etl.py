#!/usr/bin/env python3
"""Build ImpactLens analytical tables from ASER district benchmarks."""

from __future__ import annotations

import json
import math
import random
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
BENCHMARK_PATH = PROCESSED / "aser_district_benchmarks.csv"
RANDOM = random.Random(42)

PROGRAMS = [
    ("Teaching at the Right Level", 2480, 14.5),
    ("Mother Tongue Reading Camp", 1840, 12.0),
    ("Foundational Math Lab", 2150, 13.0),
    ("Digital Practice Circle", 1760, 8.0),
    ("Remedial Bridge Course", 2660, 16.0),
]
FIELD_WORKERS = [
    "Anita Kumar",
    "Rafiq Ansari",
    "Meera Patil",
    "Sonal Jain",
    "Devendra Singh",
    "Lalita Yadav",
    "Nusrat Khan",
    "Priyanka Rathore",
]
SCHOOL_TYPES = ["Government", "Government-aided", "Private low-fee"]
GENDERS = ["Girl", "Boy", "Non-binary"]


def main() -> int:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    if not BENCHMARK_PATH.exists():
        raise FileNotFoundError("Run scripts/acquire_aser_data.py before ETL.")

    benchmarks = pd.read_csv(BENCHMARK_PATH)
    records = build_intervention_records(benchmarks)
    cleaned, quality = clean_and_score(records)
    monthly = build_monthly_series(cleaned)

    analytics = {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "data_source": {
            "name": "ASER Centre Annual Status of Education Report 2024 district estimate PDFs",
            "url": "https://asercentre.org/aser-2024/",
            "access_note": "Public district-level PDFs are downloaded by scripts/acquire_aser_data.py. Student intervention records are synthetic NGO monitoring records calibrated from public ASER district learning levels.",
        },
        "records": cleaned.to_dict(orient="records"),
        "district_benchmarks": benchmarks.to_dict(orient="records"),
        "quality": quality,
        "monthly_series": monthly,
    }

    (PROCESSED / "intervention_records.csv").write_text(cleaned.to_csv(index=False), encoding="utf-8")
    (PROCESSED / "analytics.json").write_text(json.dumps(analytics, indent=2), encoding="utf-8")
    (PROCESSED / "seed_records.json").write_text(json.dumps(cleaned.to_dict(orient="records"), indent=2), encoding="utf-8")
    print(f"wrote {len(cleaned)} clean records with quality score {quality['quality_score']}/100")
    return 0


def build_intervention_records(benchmarks: pd.DataFrame) -> pd.DataFrame:
    rows = []
    start_base = date(2025, 4, 1)
    student_counter = 1
    for _, district in benchmarks.iterrows():
        district_need = 100 - ((district.std3_5_reading_pct + district.std3_5_subtraction_pct) / 2)
        sample_size = int(38 + district_need / 2.4)
        for index in range(sample_size):
            program_name, base_cost, program_lift = weighted_program(district_need)
            gender = RANDOM.choices(GENDERS, weights=[0.49, 0.49, 0.02], k=1)[0]
            age = RANDOM.randint(6, 14)
            school_type = RANDOM.choices(SCHOOL_TYPES, weights=[0.72, 0.14, 0.14], k=1)[0]
            attendance = clamp(RANDOM.gauss(81 - district.not_enrolled_pct / 4, 9), 45, 99)
            attendance_lift = max((attendance - 70) * 0.22, -5)
            gender_lift = 1.8 if gender == "Girl" else 0.7 if gender == "Boy" else 1.0
            noise = RANDOM.gauss(0, 5.2)

            baseline_reading = clamp(RANDOM.gauss(district.std3_5_reading_pct, 10), 5, 92)
            baseline_math = clamp(RANDOM.gauss(district.std3_5_subtraction_pct, 10), 5, 92)
            endline_reading = clamp(baseline_reading + program_lift + attendance_lift + gender_lift + noise, 8, 100)
            endline_math = clamp(baseline_math + program_lift * 0.92 + attendance_lift + noise, 8, 100)
            program_start = start_base + timedelta(days=RANDOM.randint(0, 245))
            duration = RANDOM.randint(72, 150)
            program_end = program_start + timedelta(days=duration)
            assessment = program_end + timedelta(days=RANDOM.randint(1, 21))
            cost = round(base_cost * RANDOM.uniform(0.82, 1.28) * (1 + district_need / 250), 2)

            rows.append(
                {
                    "student_id": f"IL-{student_counter:05d}",
                    "district": district.district,
                    "state": district.state,
                    "gender": gender,
                    "age": age,
                    "school_type": school_type,
                    "attendance_percentage": round(attendance, 1),
                    "baseline_reading_score": round(baseline_reading, 1),
                    "endline_reading_score": round(endline_reading, 1),
                    "baseline_math_score": round(baseline_math, 1),
                    "endline_math_score": round(endline_math, 1),
                    "program_type": program_name,
                    "program_start_date": program_start.isoformat(),
                    "program_end_date": program_end.isoformat(),
                    "program_cost": cost,
                    "field_worker": RANDOM.choice(FIELD_WORKERS),
                    "assessment_date": assessment.isoformat(),
                    "source_reading_competency_rate": float(district.std3_5_reading_pct),
                    "source_math_competency_rate": float(district.std3_5_subtraction_pct),
                }
            )
            student_counter += 1
    return pd.DataFrame(rows)


def weighted_program(district_need: float):
    weights = [
        0.22 + district_need / 500,
        0.18 + district_need / 650,
        0.2 + district_need / 620,
        0.2,
        0.2 + district_need / 700,
    ]
    return RANDOM.choices(PROGRAMS, weights=weights, k=1)[0]


def clean_and_score(records: pd.DataFrame):
    before = len(records)
    records = records.drop_duplicates(subset=["student_id"]).copy()
    duplicate_records = before - len(records)

    required = [
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
        "assessment_date",
    ]
    missing_values = int(records[required].isna().sum().sum())
    for column in required:
        if records[column].dtype.kind in "biufc":
            records[column] = records[column].fillna(records[column].median())
        else:
            records[column] = records[column].fillna("Unknown")

    invalid_mask = (
        ~records["age"].between(6, 14)
        | ~records["attendance_percentage"].between(0, 100)
        | ~records["baseline_reading_score"].between(0, 100)
        | ~records["endline_reading_score"].between(0, 100)
        | ~records["baseline_math_score"].between(0, 100)
        | ~records["endline_math_score"].between(0, 100)
        | (pd.to_datetime(records["program_end_date"]) < pd.to_datetime(records["program_start_date"]))
    )
    invalid_entries = int(invalid_mask.sum())
    records = records.loc[~invalid_mask].copy()

    numeric = [
        "attendance_percentage",
        "baseline_reading_score",
        "endline_reading_score",
        "baseline_math_score",
        "endline_math_score",
        "program_cost",
    ]
    outlier_count = 0
    for column in numeric:
        z = (records[column] - records[column].mean()) / records[column].std(ddof=0)
        outliers = z.abs() > 3.2
        outlier_count += int(outliers.sum())
        lo, hi = records[column].quantile([0.01, 0.99])
        records.loc[outliers, column] = records.loc[outliers, column].clip(lo, hi)

    penalty = missing_values * 0.02 + duplicate_records * 0.5 + invalid_entries * 1.2 + outlier_count * 0.08
    quality_score = round(max(0, 100 - penalty), 1)
    quality = {
        "total_records": int(len(records)),
        "missing_values": missing_values,
        "duplicate_records": duplicate_records,
        "invalid_entries": invalid_entries,
        "outliers": outlier_count,
        "quality_score": quality_score,
        "issues": [
            {
                "type": "missing",
                "field": "required_fields",
                "count": missing_values,
                "severity": "low" if missing_values < 10 else "medium",
                "description": "Missing required values filled with median or Unknown according to field type.",
            },
            {
                "type": "duplicate",
                "field": "student_id",
                "count": duplicate_records,
                "severity": "low",
                "description": "Duplicate student identifiers removed before analytics generation.",
            },
            {
                "type": "invalid",
                "field": "validation_rules",
                "count": invalid_entries,
                "severity": "high" if invalid_entries else "low",
                "description": "Rows outside score, age, attendance, and date-order validation rules were excluded.",
            },
            {
                "type": "outlier",
                "field": "numeric_measures",
                "count": outlier_count,
                "severity": "medium" if outlier_count > 15 else "low",
                "description": "Extreme numeric values were winsorized using percentile caps after z-score detection.",
            },
        ],
    }
    return records, quality


def build_monthly_series(records: pd.DataFrame):
    df = records.copy()
    df["month"] = pd.to_datetime(df["assessment_date"]).dt.to_period("M").astype(str)
    df["competent"] = (df["endline_reading_score"] >= 70) & (df["endline_math_score"] >= 70)
    grouped = (
        df.groupby("month")
        .agg(
            enrollment=("student_id", "count"),
            competency_achievement=("competent", "sum"),
            reading_gain=("endline_reading_score", "mean"),
            math_gain=("endline_math_score", "mean"),
            baseline_reading=("baseline_reading_score", "mean"),
            baseline_math=("baseline_math_score", "mean"),
            cost=("program_cost", "sum"),
        )
        .reset_index()
    )
    grouped["impact_score"] = (
        grouped["competency_achievement"] / grouped["enrollment"] * 62
        + (grouped["reading_gain"] - grouped["baseline_reading"]).clip(lower=0) * 0.55
        + (grouped["math_gain"] - grouped["baseline_math"]).clip(lower=0) * 0.55
    ).round(1)
    return grouped[["month", "impact_score", "enrollment", "competency_achievement", "cost"]].to_dict(
        orient="records"
    )


def clamp(value: float, low: float, high: float) -> float:
    return min(high, max(low, value))


if __name__ == "__main__":
    raise SystemExit(main())
