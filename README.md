# ImpactLens: NGO Impact Intelligence Platform

ImpactLens is a production-grade analytics product for NGO education programs. It turns ASER district learning data plus NGO intervention monitoring records into executive KPIs, district diagnostics, intervention ROI, demographic equity views, data-quality checks, AI-readable insights, budget simulation, and forecasting.

## What It Answers

- Are programs working?
- Which interventions create the most impact?
- Which districts are underperforming?
- What is the cost per impact?
- Which demographic groups are underserved?
- What should the Executive Director focus on every Monday?

## Data Source

Primary source: [ASER Centre Annual Status of Education Report 2024](https://asercentre.org/aser-2024/).

The acquisition script downloads district-estimate PDFs for Bihar, Maharashtra, Rajasthan, and Uttar Pradesh and extracts district-level reading and arithmetic indicators. The intervention-level student dataset is a realistic NGO monitoring table calibrated from those public ASER district benchmarks; it is not represented as ASER microdata.

## Tech Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, ShadCN-style components, Framer Motion, Recharts, SVG/D3-ready map layer
- Backend: Next.js API routes
- Database: PostgreSQL with Prisma
- Data: Python, Pandas, pypdf
- AI: OpenAI-compatible abstraction with deterministic fallback
- Deployment: Vercel-ready, Docker-ready

## Local Setup

```bash
cp .env.example .env
npm install
npm run data:all
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes for Prisma-backed deployment | PostgreSQL connection string |
| `OPENAI_API_KEY` | Optional | Enables live OpenAI-compatible insight generation |
| `OPENAI_BASE_URL` | Optional | OpenAI-compatible endpoint |
| `OPENAI_MODEL` | Optional | Chat model used for insight generation |

## Verification Commands

```bash
npm run data:all
npm run typecheck
npm run lint
npm run build
npm run validate:local
```

In this Codex sandbox, live ASER PDF acquisition succeeded after network approval. The sandbox does not include npm, Vercel CLI, or psql on PATH, so package build and Vercel deployment must be run in a normal Node/Vercel environment.

## Deployment

### Vercel

1. Create a PostgreSQL database, for example Vercel Postgres, Neon, Supabase, or RDS.
2. Set `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` in Vercel project settings.
3. Run:

```bash
npm install
npm run data:all
npm run db:generate
npm run db:push
npm run db:seed
vercel --prod
```

### Docker

```bash
docker compose up --build
```

## Deliverables Map

- Source code: `app/`, `components/`, `lib/`
- Database schema: `prisma/schema.prisma`
- ETL and acquisition: `scripts/acquire_aser_data.py`, `scripts/etl.py`
- Processed seed data: `data/processed/`
- Deployment: `Dockerfile`, `docker-compose.yml`, `vercel.json`
- Docs: `docs/`
- Screenshot preview: `public/screenshots/impactlens-overview.svg`
- Folder structure: `docs/FOLDER_STRUCTURE.md`
