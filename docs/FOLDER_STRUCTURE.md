# Folder Structure

```text
.
├── app/                         # Next.js app routes and API routes
│   ├── api/                     # Analytics, quality, insights, scenario, forecast, seed APIs
│   ├── globals.css              # Design tokens, light/dark theme, global styling
│   ├── layout.tsx               # App shell metadata
│   └── page.tsx                 # ImpactLens dashboard entry point
├── components/
│   ├── dashboard/               # Full product dashboard UI
│   └── ui/                      # ShadCN-style primitives
├── data/
│   ├── raw/                     # Downloaded ASER PDFs, ignored by git
│   └── processed/               # Benchmarks, intervention records, seed JSON, analytics JSON
├── docs/                        # Product, API, KPI, architecture, user, and evaluation docs
├── lib/
│   ├── ai/                      # OpenAI-compatible insight abstraction
│   ├── analytics/               # KPI, forecasting, scenario, insight calculations
│   └── data/                    # Shared data types and loaders
├── prisma/                      # PostgreSQL schema and seed script
├── public/screenshots/          # Dashboard preview screenshot
├── scripts/                     # ASER acquisition, ETL, and local validation
├── Dockerfile                   # Production container build
├── docker-compose.yml           # Local app + PostgreSQL stack
├── vercel.json                  # Vercel deployment configuration
└── README.md                    # Setup, deployment, and deliverables map
```

