import type { MonthlySeriesPoint } from "@/lib/data/types";

export interface ForecastPoint extends MonthlySeriesPoint {
  type: "actual" | "forecast";
  lowerBound: number;
  upperBound: number;
}

export function forecastSeries(series: MonthlySeriesPoint[], months = 6): ForecastPoint[] {
  const actual: ForecastPoint[] = series.map((point) => ({
    ...point,
    type: "actual",
    lowerBound: point.impact_score,
    upperBound: point.impact_score
  }));

  const x = series.map((_, index) => index + 1);
  const y = series.map((point) => point.impact_score);
  const { slope, intercept } = linearRegression(x, y);
  const enrollmentTrend = linearRegression(
    x,
    series.map((point) => point.enrollment)
  );
  const competencyTrend = linearRegression(
    x,
    series.map((point) => point.competency_achievement)
  );
  const costTrend = linearRegression(
    x,
    series.map((point) => point.cost)
  );
  const residual = Math.max(
    2,
    Math.sqrt(
      y.reduce((total, value, index) => total + Math.pow(value - (intercept + slope * x[index]), 2), 0) /
        y.length
    )
  );

  const lastDate = new Date(`${series[series.length - 1].month}-01T00:00:00.000Z`);
  const forecast: ForecastPoint[] = Array.from({ length: months }, (_, index) => {
    const position = series.length + index + 1;
    const date = new Date(lastDate);
    date.setUTCMonth(date.getUTCMonth() + index + 1);
    const impactScore = clamp(intercept + slope * position, 0, 100);

    return {
      month: date.toISOString().slice(0, 7),
      impact_score: Number(impactScore.toFixed(1)),
      enrollment: Math.round(Math.max(0, enrollmentTrend.intercept + enrollmentTrend.slope * position)),
      competency_achievement: Math.round(
        Math.max(0, competencyTrend.intercept + competencyTrend.slope * position)
      ),
      cost: Math.round(Math.max(0, costTrend.intercept + costTrend.slope * position)),
      type: "forecast",
      lowerBound: Number(clamp(impactScore - residual * 1.35, 0, 100).toFixed(1)),
      upperBound: Number(clamp(impactScore + residual * 1.35, 0, 100).toFixed(1))
    };
  });

  return [...actual, ...forecast];
}

function linearRegression(x: number[], y: number[]) {
  const n = x.length;
  const sumX = x.reduce((total, value) => total + value, 0);
  const sumY = y.reduce((total, value) => total + value, 0);
  const sumXY = x.reduce((total, value, index) => total + value * y[index], 0);
  const sumXX = x.reduce((total, value) => total + value * value, 0);
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
