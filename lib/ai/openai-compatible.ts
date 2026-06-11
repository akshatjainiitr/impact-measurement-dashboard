import { generateDeterministicInsights } from "@/lib/analytics/insights";
import type { AnalyticsDataset } from "@/lib/data/types";

export interface InsightProvider {
  generateInsights(dataset: AnalyticsDataset): Promise<string[]>;
}

export class DeterministicInsightProvider implements InsightProvider {
  async generateInsights(dataset: AnalyticsDataset) {
    return generateDeterministicInsights(dataset).map((insight) => insight.body);
  }
}

export class OpenAICompatibleInsightProvider implements InsightProvider {
  constructor(
    private readonly apiKey = process.env.OPENAI_API_KEY,
    private readonly baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    private readonly model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  ) {}

  async generateInsights(dataset: AnalyticsDataset) {
    if (!this.apiKey) {
      return new DeterministicInsightProvider().generateInsights(dataset);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are an NGO impact measurement advisor. Return concise, decision-oriented dashboard insights grounded only in the supplied metrics."
          },
          {
            role: "user",
            content: JSON.stringify({
              source: dataset.data_source,
              quality: dataset.quality,
              record_count: dataset.records.length,
              monthly_series: dataset.monthly_series
            })
          }
        ]
      })
    });

    if (!response.ok) {
      return new DeterministicInsightProvider().generateInsights(dataset);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return (
      payload.choices?.[0]?.message?.content
        ?.split(/\n+/)
        .map((line) => line.replace(/^[-*\d. ]+/, "").trim())
        .filter(Boolean) ?? []
    );
  }
}
