# Evaluation Checklist

| Requirement | Evidence |
| --- | --- |
| Real education outcome data | ASER 2024 district PDFs downloaded and extracted by `scripts/acquire_aser_data.py` |
| Reproducible ETL | `scripts/acquire_aser_data.py`, `scripts/etl.py`, processed outputs in `data/processed/` |
| Required data model fields | `data/processed/intervention_records.csv`, `prisma/schema.prisma` |
| Missing value handling | `clean_and_score()` in `scripts/etl.py` |
| Duplicate detection | `drop_duplicates(subset=["student_id"])` in ETL and quality score |
| Outlier detection | z-score detection and winsorization in ETL |
| Validation rules | Age, score, attendance, and date-order validation in ETL |
| PostgreSQL storage | Prisma schema and seed script |
| KPI hierarchy | Dashboard KPI Tree and `docs/KPI_DOCUMENTATION.md` |
| Monday Number | Impact Efficiency Score in hero and KPI docs |
| Executive overview | Dashboard metric row and Monday brief |
| Learning outcomes | Trend and pre/post distribution charts |
| Demographic reach | Gender, age, and state charts |
| Geographic impact | Interactive India SVG map colored by impact score |
| Data Quality Center | Dashboard panel and `/api/quality` |
| AI Insights | Dashboard insights and `/api/insights` |
| Scenario Simulator | Budget slider and `/api/scenario` |
| Forecasting | Dashboard forecast and `/api/forecast` |
| Premium SaaS design | Custom tokens, light/dark mode, motion, typography, spacing |
| Deployment config | `vercel.json`, `Dockerfile`, `docker-compose.yml` |
| API documentation | `docs/API.md` |
| User guide | `docs/USER_GUIDE.md` |
| Architecture and ER diagrams | `docs/ARCHITECTURE.md` |

