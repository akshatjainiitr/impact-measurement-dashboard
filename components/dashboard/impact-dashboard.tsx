"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  Brain,
  CheckCircle2,
  Database,
  IndianRupee,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useMemo, useState } from "react";
import type { AnalyticsDataset } from "@/lib/data/types";
import { generateDeterministicInsights } from "@/lib/analytics/insights";
import {
  ageGroups,
  breakdown,
  computeDistrictImpact,
  computeExecutiveMetrics,
  computeProgramPerformance
} from "@/lib/analytics/metrics";
import { forecastSeries } from "@/lib/analytics/forecast";
import { simulateBudgetIncrease } from "@/lib/analytics/scenario";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const palette = ["#27624b", "#5aa79d", "#d79b43", "#8ebf7a", "#2d7a78", "#153f33"];

export function ImpactDashboard({ dataset }: { dataset: AnalyticsDataset }) {
  const [selectedKpi, setSelectedKpi] = useState("Impact");
  const [budget, setBudget] = useState(500000);
  const metrics = useMemo(() => computeExecutiveMetrics(dataset.records), [dataset.records]);
  const districts = useMemo(() => computeDistrictImpact(dataset), [dataset]);
  const programs = useMemo(() => computeProgramPerformance(dataset.records), [dataset.records]);
  const insights = useMemo(() => generateDeterministicInsights(dataset), [dataset]);
  const gender = useMemo(() => breakdown(dataset.records, "gender"), [dataset.records]);
  const states = useMemo(() => breakdown(dataset.records, "state"), [dataset.records]);
  const ages = useMemo(() => ageGroups(dataset.records), [dataset.records]);
  const forecast = useMemo(() => forecastSeries(dataset.monthly_series), [dataset.monthly_series]);
  const scenario = useMemo(() => simulateBudgetIncrease(dataset.records, budget), [dataset.records, budget]);
  const topDistrict = [...districts].sort((a, b) => b.impactScore - a.impactScore)[0];
  const weakDistrict = [...districts].sort((a, b) => a.impactScore - b.impactScore)[0];

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-forest-500/10 bg-ivory/72 p-5 shadow-soft backdrop-blur-xl dark:bg-forest-950/60 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-ivory shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">ImpactLens</p>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                NGO Impact Intelligence Platform
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              Source: ASER 2024 district PDFs
            </div>
            <ThemeToggle />
          </div>
        </header>

        <Hero metrics={metrics} topDistrict={topDistrict} weakDistrict={weakDistrict} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Target} label="Impact Efficiency Score" value={(metrics.impactEfficiencyScore * 100000).toFixed(2)} detail="competent learners per Rs. 1 lakh" emphasis />
          <MetricCard icon={IndianRupee} label="Cost per Impact" value={formatCurrency(metrics.costPerImpact)} detail="per competency achievement" />
          <MetricCard icon={Users} label="Beneficiaries Reached" value={formatNumber(metrics.beneficiariesReached)} detail="clean intervention records" />
          <MetricCard icon={CheckCircle2} label="Completion Rate" value={formatPercent(metrics.programCompletionRate)} detail="programs assessed after endline" />
          <MetricCard icon={TrendingUp} label="Learning Improvement" value={formatPercent(metrics.learningImprovementPct)} detail="avg pre/post lift" />
          <MetricCard icon={Activity} label="Active Programs" value={String(metrics.activePrograms)} detail="evidence-linked interventions" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <KpiTree selected={selectedKpi} onSelect={setSelectedKpi} />
          <Card>
            <CardHeader>
              <CardTitle>Executive Overview</CardTitle>
              <CardDescription>Activities-to-impact snapshot for Monday leadership review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Classes conducted", "2,946", "Activities"],
                  ["Assessments conducted", formatNumber(dataset.records.length * 2), "Activities"],
                  ["Students reached", formatNumber(metrics.beneficiariesReached), "Outputs"],
                  ["Students assessed", formatNumber(dataset.records.length), "Outputs"],
                  ["Avg reading gain", `${avgGain(dataset.records, "reading").toFixed(1)} pts`, "Outcomes"],
                  ["Competency achieved", formatNumber(metrics.studentsAchievingCompetency), "Impact"]
                ].map(([label, value, stage]) => (
                  <div key={label} className="rounded-2xl border bg-card/55 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{stage}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-forest-700 p-5 text-ivory dark:bg-teal/20">
                <p className="text-sm uppercase tracking-[0.24em] text-ivory/70">Selected KPI</p>
                <h3 className="mt-2 text-2xl font-semibold">{selectedKpi}</h3>
                <p className="mt-2 text-sm leading-6 text-ivory/78">{kpiNarrative(selectedKpi)}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <LearningOutcomes records={dataset.records} monthly={dataset.monthly_series} />
          <ProgramEfficiency programs={programs} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
          <DemographicReach gender={gender} states={states} ages={ages} />
          <GeographicImpact districts={districts} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <DataQuality quality={dataset.quality} />
          <AiInsights insights={insights} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <ScenarioSimulator budget={budget} setBudget={setBudget} scenario={scenario} />
          <Forecasting forecast={forecast} />
        </section>

        <footer className="rounded-3xl border bg-card/55 p-6 text-sm text-muted-foreground">
          Built from ASER 2024 district estimate PDFs via reproducible acquisition and ETL scripts. The student
          intervention table is a realistic NGO monitoring dataset calibrated from public ASER district learning
          levels, not claimed as ASER microdata.
        </footer>
      </section>
    </main>
  );
}

function Hero({
  metrics,
  topDistrict,
  weakDistrict
}: {
  metrics: ReturnType<typeof computeExecutiveMetrics>;
  topDistrict: ReturnType<typeof computeDistrictImpact>[number];
  weakDistrict: ReturnType<typeof computeDistrictImpact>[number];
}) {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(90,167,157,.26),transparent_24rem)]" />
      <div className="relative grid gap-8 p-7 lg:grid-cols-[1fr_24rem] lg:p-10">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
            <BadgeIndianRupee className="h-4 w-4 text-teal" />
            Monday Number
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal">Impact Efficiency Score</p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="metric-number mt-2 text-6xl font-semibold text-forest-700 dark:text-primary sm:text-8xl"
          >
            {(metrics.impactEfficiencyScore * 100000).toFixed(2)}
          </motion.h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Students achieving reading and math competency per Rs. 1 lakh invested. This is the single executive
            metric for deciding where attention and flexible budget should move this week.
          </p>
        </div>
        <div className="grid content-between gap-4 rounded-[1.75rem] bg-forest-700 p-5 text-ivory dark:bg-forest-950">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ivory/60">Monday Brief</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Scale what works, inspect what lags.</h3>
          </div>
          <div className="space-y-3">
            <BriefLine label="Best proof point" value={`${topDistrict.district}, ${topDistrict.state}`} />
            <BriefLine label="Needs review" value={`${weakDistrict.district}, ${weakDistrict.state}`} />
            <BriefLine label="Total investment tracked" value={formatCurrency(metrics.totalProgramCost)} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/8 p-3">
      <span className="text-sm text-ivory/68">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  emphasis
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <Card className={emphasis ? "bg-forest-700 text-ivory dark:bg-teal/20" : ""}>
      <CardContent className="p-5">
        <Icon className={emphasis ? "h-5 w-5 text-ivory/80" : "h-5 w-5 text-teal"} />
        <p className="mt-5 text-sm text-muted-foreground">{label}</p>
        <p className="metric-number mt-1 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function KpiTree({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  const nodes = [
    { stage: "Activities", items: ["Classes conducted", "Assessments conducted"], icon: Activity },
    { stage: "Outputs", items: ["Students reached", "Students assessed"], icon: Users },
    { stage: "Outcomes", items: ["Reading improvement", "Math improvement"], icon: TrendingUp },
    { stage: "Impact", items: ["Grade-level competency", "Impact Efficiency Score"], icon: Target }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Tree Explorer</CardTitle>
        <CardDescription>Click a node to trace how field activity becomes executive impact.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          {nodes.map((group, index) => (
            <div key={group.stage} className="relative">
              <div className="mb-3 flex items-center gap-2">
                <group.icon className="h-4 w-4 text-teal" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.stage}
                </p>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => onSelect(group.stage === "Impact" ? "Impact" : item)}
                    className={`w-full rounded-2xl border p-4 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
                      selected === item || selected === group.stage
                        ? "border-teal bg-teal/12"
                        : "bg-card/50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {index < nodes.length - 1 ? (
                <ArrowRight className="absolute right-[-1.1rem] top-1/2 hidden h-5 w-5 text-muted-foreground md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LearningOutcomes({
  records,
  monthly
}: {
  records: AnalyticsDataset["records"];
  monthly: AnalyticsDataset["monthly_series"];
}) {
  const distribution = ["0-20", "21-40", "41-60", "61-80", "81-100"].map((bucket) => {
    const [min, max] = bucket.split("-").map(Number);
    return {
      bucket,
      baseline: records.filter((r) => avg([r.baseline_reading_score, r.baseline_math_score]) >= min && avg([r.baseline_reading_score, r.baseline_math_score]) <= max).length,
      endline: records.filter((r) => avg([r.endline_reading_score, r.endline_math_score]) >= min && avg([r.endline_reading_score, r.endline_math_score]) <= max).length
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Outcomes</CardTitle>
        <CardDescription>Reading, math, competency trend, and pre/post distributions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Monthly Competency Trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5aa79d" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#5aa79d" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area dataKey="impact_score" stroke="#27624b" fill="url(#impactFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame title="Pre vs Post Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="baseline" fill="#d79b43" radius={[8, 8, 0, 0]} />
              <Bar dataKey="endline" fill="#27624b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardContent>
    </Card>
  );
}

function ProgramEfficiency({ programs }: { programs: ReturnType<typeof computeProgramPerformance> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention ROI</CardTitle>
        <CardDescription>Which intervention creates the most impact per rupee?</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={programs} layout="vertical" margin={{ left: 18 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="program" width={132} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="costPerImpact" fill="#5aa79d" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function DemographicReach({
  gender,
  states,
  ages
}: {
  gender: ReturnType<typeof breakdown>;
  states: ReturnType<typeof breakdown>;
  ages: ReturnType<typeof ageGroups>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demographic Reach</CardTitle>
        <CardDescription>Equity view across gender, age groups, districts, and states.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Gender Reach">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={gender} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={5}>
                {gender.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame title="Age Competency">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={ages}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`} />
              <Tooltip formatter={(value) => formatPercent(Number(value))} />
              <Bar dataKey="competencyRate" fill="#27624b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={states}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#5aa79d" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function GeographicImpact({ districts }: { districts: ReturnType<typeof computeDistrictImpact> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Impact</CardTitle>
        <CardDescription>Interactive India map colored by district impact score.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1fr_16rem]">
        <div className="relative min-h-[430px] rounded-[2rem] border bg-gradient-to-br from-ivory to-teal/10 p-5 dark:from-forest-950 dark:to-teal/10">
          <svg viewBox="0 0 420 520" className="h-full min-h-[390px] w-full">
            <path
              d="M205 24 C276 45 334 99 352 170 C377 270 321 321 300 394 C281 459 248 500 203 493 C155 486 128 430 108 375 C84 310 55 259 74 184 C92 113 137 46 205 24Z"
              fill="rgba(90,167,157,.12)"
              stroke="rgba(39,98,75,.28)"
              strokeWidth="2"
            />
            {districts.map((district) => {
              const x = 70 + ((district.lng - 68) / 20) * 280;
              const y = 470 - ((district.lat - 8) / 25) * 420;
              const radius = 7 + district.students / 35;
              return (
                <g key={`${district.state}-${district.district}`} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={impactColor(district.impactScore)}
                    opacity="0.82"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text x={x + 9} y={y - 9} className="hidden fill-current text-[10px] font-semibold group-hover:block">
                    {district.district}: {district.impactScore}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="space-y-3">
          {[...districts]
            .sort((a, b) => b.impactScore - a.impactScore)
            .slice(0, 7)
            .map((district) => (
              <div key={district.district} className="rounded-2xl border bg-card/55 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{district.district}</p>
                  <p className="text-sm font-semibold text-teal">{district.impactScore}</p>
                </div>
                <p className="text-xs text-muted-foreground">{district.state}</p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DataQuality({ quality }: { quality: AnalyticsDataset["quality"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality Center</CardTitle>
        <CardDescription>Validation, deduplication, outliers, and board-confidence score.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between rounded-[2rem] bg-forest-700 p-6 text-ivory">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-ivory/60">Quality Score</p>
            <p className="metric-number mt-2 text-6xl font-semibold">{quality.quality_score}</p>
          </div>
          <Database className="h-10 w-10 text-ivory/60" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Missing values", quality.missing_values],
            ["Duplicate records", quality.duplicate_records],
            ["Invalid entries", quality.invalid_entries],
            ["Outliers reviewed", quality.outliers]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-card/55 p-4">
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {quality.issues.map((issue) => (
            <div key={issue.type} className="flex gap-3 rounded-2xl border bg-card/55 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <p className="text-sm text-muted-foreground">{issue.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AiInsights({ insights }: { insights: ReturnType<typeof generateDeterministicInsights> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Natural-language decision support with deterministic fallback.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <div key={insight.title} className="rounded-2xl border bg-card/55 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Brain className="h-4 w-4 text-teal" />
              <span className="rounded-full bg-teal/12 px-2.5 py-1 text-xs text-teal">{insight.priority}</span>
            </div>
            <h3 className="font-semibold">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ScenarioSimulator({
  budget,
  setBudget,
  scenario
}: {
  budget: number;
  setBudget: (value: number) => void;
  scenario: ReturnType<typeof simulateBudgetIncrease>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Simulator</CardTitle>
        <CardDescription>Increase budget and predict beneficiaries, outcomes, and impact.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <input
          type="range"
          min={100000}
          max={2500000}
          step={50000}
          value={budget}
          onChange={(event) => setBudget(Number(event.target.value))}
          className="w-full accent-teal"
        />
        <div className="rounded-[2rem] bg-forest-700 p-5 text-ivory">
          <p className="text-sm text-ivory/70">Additional budget</p>
          <p className="metric-number text-5xl font-semibold">{formatCurrency(budget)}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ScenarioStat label="Beneficiaries" value={formatNumber(scenario.additionalBeneficiaries)} />
          <ScenarioStat label="Outcome points" value={formatNumber(scenario.additionalOutcomes)} />
          <ScenarioStat label="Additional impact" value={formatNumber(scenario.additionalImpact)} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Recommended allocation: <span className="font-semibold text-foreground">{scenario.bestProgram}</span>.
          Model confidence: {formatPercent(scenario.confidence, 0)}.
        </p>
      </CardContent>
    </Card>
  );
}

function Forecasting({ forecast }: { forecast: ReturnType<typeof forecastSeries> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecasting</CardTitle>
        <CardDescription>Impact score, enrollment, and competency achievement forecast.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={330}>
          <ComposedChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" dataKey="upperBound" fill="#5aa79d" stroke="none" opacity={0.14} />
            <Line yAxisId="left" dataKey="impact_score" stroke="#27624b" strokeWidth={2.5} dot={false} />
            <Bar yAxisId="right" dataKey="competency_achievement" fill="#d79b43" radius={[8, 8, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card/45 p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function ScenarioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card/55 p-4">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function kpiNarrative(selected: string) {
  const copy: Record<string, string> = {
    "Classes conducted":
      "Class volume is checked against attendance and assessment completion so activity does not masquerade as impact.",
    "Assessments conducted":
      "Assessment coverage determines whether outcome claims are defensible enough for leadership and funders.",
    "Students reached":
      "Reach is split by geography and demographics to show whether the program is serving underserved children.",
    "Students assessed":
      "Assessed learners form the analytic denominator for reading, math, and competency achievement.",
    "Reading improvement":
      "Reading gain compares baseline and endline scores and is benchmarked against ASER district learning levels.",
    "Math improvement":
      "Math gain follows the same pre/post logic and feeds the competency threshold used in impact scoring.",
    Impact:
      "Impact means a child reaches grade-level competency in both reading and math, then gets divided by program cost for the Monday Number."
  };
  return copy[selected] ?? copy.Impact;
}

function avgGain(records: AnalyticsDataset["records"], subject: "reading" | "math") {
  const values = records.map((record) =>
    subject === "reading"
      ? record.endline_reading_score - record.baseline_reading_score
      : record.endline_math_score - record.baseline_math_score
  );
  return avg(values);
}

function avg(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function impactColor(score: number) {
  if (score >= 72) return "#27624b";
  if (score >= 62) return "#5aa79d";
  if (score >= 52) return "#d79b43";
  return "#b85c38";
}
