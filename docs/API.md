# API Documentation

All routes are implemented with Next.js API routes and return JSON.

## `GET /api/analytics`

Returns executive KPIs, district impact, program performance, and monthly series.

## `GET /api/quality`

Returns missing values, duplicates, invalid entries, outliers, quality score, and issue details.

## `GET /api/insights`

Returns natural-language executive, program, equity, and data-quality insights.

## `GET /api/scenario?budget=500000`

Returns:

```json
{
  "additionalBudget": 500000,
  "additionalBeneficiaries": 218,
  "additionalOutcomes": 2867,
  "additionalImpact": 164,
  "bestProgram": "Mother Tongue Reading Camp",
  "confidence": 0.78
}
```

## `POST /api/scenario`

Body:

```json
{ "budget": 750000 }
```

## `GET /api/forecast`

Returns actual and forecast points for impact score, enrollment, and competency achievement.

## `GET /api/seed`

Returns the first 50 generated seed records and record count for quick inspection.

