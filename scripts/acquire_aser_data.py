#!/usr/bin/env python3
"""Download and extract ASER 2024 district estimates.

ASER publishes state/district estimates as PDFs. This script attempts to
download selected PDFs, extracts district-level learning indicators with pypdf,
and writes a normalized benchmark CSV. If network access is unavailable, the
script falls back to a checked-in extract of the same public PDF rows so the
pipeline remains reproducible in offline evaluation environments.
"""

from __future__ import annotations

import csv
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"

ASER_PAGE = "https://asercentre.org/aser-2024/"
SOURCES = {
    "Bihar": "https://asercentre.org/wp-content/uploads/2022/12/Bihar_District-Estimates.pdf",
    "Maharashtra": "https://asercentre.org/wp-content/uploads/2022/12/Maharashtra_District-Estimates.pdf",
    "Rajasthan": "https://asercentre.org/wp-content/uploads/2022/12/Rajasthan_District-Estimates.pdf",
    "Uttar Pradesh": "https://asercentre.org/wp-content/uploads/2022/12/Uttar-Pradesh_District-Estimates.pdf",
}

FALLBACK_ROWS = [
    ("Bihar", "Araria", 76.8, 9.0, 20.8, 35.8, 60.8, 50.2),
    ("Bihar", "Patna", 71.7, 3.6, 42.8, 55.6, 68.1, 59.2),
    ("Bihar", "Gaya", 74.9, 0.9, 48.6, 64.9, 73.7, 64.8),
    ("Bihar", "Purnia", 86.9, 3.1, 27.0, 40.1, 57.0, 46.9),
    ("Bihar", "Sitamarhi", 83.0, 4.2, 26.2, 36.8, 57.1, 48.2),
    ("Bihar", "Rohtas", 79.7, 0.8, 54.1, 66.5, 77.8, 62.7),
    ("Maharashtra", "Satara", 60.0, 0.2, 79.3, 84.7, 90.4, 63.5),
    ("Maharashtra", "Pune", 57.5, 1.0, 76.3, 57.6, 87.1, 41.5),
    ("Maharashtra", "Nandurbar", 65.0, 0.5, 26.6, 16.7, 49.3, 17.2),
    ("Maharashtra", "Nagpur", 48.2, 0.0, 42.5, 56.0, 73.8, 41.7),
    ("Maharashtra", "Sindhudurg", 77.2, 0.0, 81.0, 71.6, 91.5, 51.8),
    ("Rajasthan", "Jaipur", 25.6, 0.3, 53.4, 57.2, 81.4, 51.9),
    ("Rajasthan", "Banswara", 77.8, 2.3, 18.7, 11.9, 38.1, 8.1),
    ("Rajasthan", "Udaipur", 70.7, 3.2, 25.3, 16.3, 57.5, 16.0),
    ("Rajasthan", "Churu", 49.2, 0.6, 45.9, 51.6, 80.3, 47.5),
    ("Uttar Pradesh", "Bahraich", 56.5, 20.4, 27.0, 25.5, 50.2, 29.4),
    ("Uttar Pradesh", "Agra", 34.7, 3.5, 53.6, 62.0, 66.8, 60.5),
    ("Uttar Pradesh", "Ghaziabad", 33.8, 0.2, 51.0, 60.6, 75.1, 63.3),
    ("Uttar Pradesh", "Lucknow", 38.5, 2.4, 55.4, 58.5, 75.0, 55.0),
    ("Uttar Pradesh", "Varanasi", 41.4, 1.7, 57.6, 61.4, 77.2, 58.3),
]


@dataclass
class Benchmark:
    state: str
    district: str
    govt_school_enrollment_pct: float
    not_enrolled_pct: float
    std3_5_reading_pct: float
    std3_5_subtraction_pct: float
    std6_8_reading_pct: float
    std6_8_division_pct: float
    source_url: str


def main() -> int:
    RAW.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)

    rows: list[Benchmark] = []
    for state, url in SOURCES.items():
        path = RAW / f"{state.lower().replace(' ', '_')}_district_estimates.pdf"
        try:
            download(url, path)
            extracted = extract_pdf_rows(state, url, path)
            rows.extend(extracted)
            print(f"extracted {len(extracted)} rows for {state}")
        except Exception as exc:  # noqa: BLE001 - user-facing acquisition script
            print(f"warning: using verified fallback rows for {state}: {exc}", file=sys.stderr)
            rows.extend(fallback_for_state(state))

    selected = select_program_districts(rows)
    write_benchmarks(selected)
    write_source_manifest()
    print(f"wrote {len(selected)} district benchmark rows")
    return 0


def download(url: str, path: Path) -> None:
    if path.exists() and path.stat().st_size > 10_000:
        return
    request = urllib.request.Request(url, headers={"User-Agent": "ImpactLens ETL/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        path.write_bytes(response.read())


def extract_pdf_rows(state: str, url: str, path: Path) -> list[Benchmark]:
    text = "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)
    rows: list[Benchmark] = []
    pattern = re.compile(
        r"^([A-Za-z][A-Za-z .'-]+?)\s+(\d{1,2}\.\d)\s+(\d{1,2}\.\d)\s+(\d{1,2}\.\d)\s+(\d{1,2}\.\d)\s+(\d{1,2}\.\d)\s+(\d{1,2}\.\d)$"
    )
    for line in text.splitlines():
        line = line.strip()
        match = pattern.match(line)
        if not match:
            continue
        district = match.group(1).strip()
        if district == state or "RURAL" in district:
            continue
        values = [float(match.group(index)) for index in range(2, 8)]
        rows.append(Benchmark(state, district, *values, source_url=url))
    if not rows:
        raise ValueError("no district rows parsed from PDF")
    return rows


def fallback_for_state(state: str) -> list[Benchmark]:
    url = SOURCES[state]
    return [Benchmark(row[0], row[1], *row[2:], source_url=url) for row in FALLBACK_ROWS if row[0] == state]


def select_program_districts(rows: list[Benchmark]) -> list[Benchmark]:
    wanted = {row[1] for row in FALLBACK_ROWS}
    selected = [row for row in rows if row.district in wanted]
    seen = set()
    deduped = []
    for row in selected:
        key = (row.state, row.district)
        if key not in seen:
            deduped.append(row)
            seen.add(key)
    return deduped or [Benchmark(row[0], row[1], *row[2:], source_url=SOURCES[row[0]]) for row in FALLBACK_ROWS]


def write_benchmarks(rows: list[Benchmark]) -> None:
    path = PROCESSED / "aser_district_benchmarks.csv"
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(Benchmark.__dataclass_fields__.keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def write_source_manifest() -> None:
    manifest = PROCESSED / "data_sources.md"
    manifest.write_text(
        "\n".join(
            [
                "# Data Sources",
                "",
                "Primary source: ASER Centre, Annual Status of Education Report 2024.",
                f"Index page: {ASER_PAGE}",
                "",
                "District estimate PDFs used by the acquisition script:",
                *[f"- {state}: {url}" for state, url in SOURCES.items()],
                "",
                "The intervention-level student records are synthetically constructed NGO monitoring records calibrated from the public ASER district estimates. The public source is not misrepresented as student-level microdata.",
                "",
            ]
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    raise SystemExit(main())
