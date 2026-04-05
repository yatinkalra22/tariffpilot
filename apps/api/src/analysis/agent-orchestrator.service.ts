import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AgentRunnerService } from './agent-runner.service';
import { HtsLookupTool } from '../tools/hts-lookup.tool';
import { Section301Tool } from '../tools/section301.tool';
import { FtaDatabaseTool } from '../tools/fta-database.tool';
import { CountryComparisonTool } from '../tools/country-comparison.tool';
import { SseEvent, ProductInput } from './types';

export type { SseEvent, ProductInput };

@Injectable()
export class AgentOrchestratorService {
  constructor(
    private runner: AgentRunnerService,
    private prisma: PrismaService,
    private htsLookup: HtsLookupTool,
    private section301: Section301Tool,
    private ftaDatabase: FtaDatabaseTool,
    private countryComparison: CountryComparisonTool,
  ) {}

  async *runAnalysis(input: ProductInput): AsyncGenerator<SseEvent> {
    const context: Record<string, unknown> = {};
    const now = () => new Date().toISOString();
    const startTime = Date.now();

    // ── STEP 1: HTS Classification ──
    yield {
      type: 'step_start',
      step: 1,
      stepName: 'HTS Classification',
      message: 'Analyzing product description...',
      timestamp: now(),
    };

    try {
      const classificationJson = await this.runner.runAgent(
        CLASSIFICATION_SYSTEM_PROMPT,
        `Classify this product: ${input.description}\nCountry of Origin: ${input.originCountry}`,
        [this.htsLookup.getDefinition()],
        (e) => {
          /* tool events */
        },
      );

      context.classification = this.safeJsonParse(classificationJson);
      yield {
        type: 'step_complete',
        step: 1,
        stepName: 'HTS Classification',
        message: 'HTS code identified',
        data: context.classification,
        timestamp: now(),
      };
    } catch (err) {
      yield {
        type: 'error',
        step: 1,
        stepName: 'HTS Classification',
        message: 'Classification failed',
        error: String(err),
        timestamp: now(),
      };
      return;
    }

    // ── STEP 2: Duty Calculation ──
    yield {
      type: 'step_start',
      step: 2,
      stepName: 'Duty Calculation',
      message: 'Stacking all US duty layers...',
      timestamp: now(),
    };

    try {
      const dutyJson = await this.runner.runAgent(
        DUTY_CALCULATION_SYSTEM_PROMPT,
        JSON.stringify({
          classification: context.classification,
          originCountry: input.originCountry,
          cifValue: input.cifValue,
        }),
        [this.section301.getDefinition()],
      );

      context.dutyCalculation = this.safeJsonParse(dutyJson);
      yield {
        type: 'step_complete',
        step: 2,
        stepName: 'Duty Calculation',
        message: 'All duty layers calculated',
        data: context.dutyCalculation,
        timestamp: now(),
      };
    } catch (err) {
      yield {
        type: 'step_complete',
        step: 2,
        stepName: 'Duty Calculation',
        message: 'Partial duty calculation (using defaults)',
        data: { error: String(err) },
        timestamp: now(),
      };
    }

    // ── STEPS 3 + 4: Parallel ──
    yield {
      type: 'step_start',
      step: 3,
      stepName: 'FTA Check',
      message: 'Checking US trade agreement partners...',
      timestamp: now(),
    };
    yield {
      type: 'step_start',
      step: 4,
      stepName: 'Country Comparison',
      message: 'Comparing source countries...',
      timestamp: now(),
    };

    const htsCode = (context.classification as any)?.code || '';

    const [ftaResult, comparisonResult] = await Promise.allSettled([
      this.runner.runAgent(
        FTA_SYSTEM_PROMPT,
        JSON.stringify({ htsCode, originCountry: input.originCountry }),
        [this.ftaDatabase.getDefinition()],
      ),
      this.runner.runAgent(
        COUNTRY_COMPARISON_SYSTEM_PROMPT,
        JSON.stringify({
          htsCode,
          mfnRate: (context.classification as any)?.mfnRate || 0,
          cifValue: input.cifValue,
        }),
        [this.countryComparison.getDefinition()],
      ),
    ]);

    if (ftaResult.status === 'fulfilled') {
      context.ftaOpportunities = this.safeJsonParse(ftaResult.value);
    }
    if (comparisonResult.status === 'fulfilled') {
      context.countryComparisons = this.safeJsonParse(comparisonResult.value);
    }

    yield {
      type: 'step_complete',
      step: 3,
      stepName: 'FTA Check',
      message: 'FTA opportunities identified',
      data: context.ftaOpportunities,
      timestamp: now(),
    };
    yield {
      type: 'step_complete',
      step: 4,
      stepName: 'Country Comparison',
      message: 'Country comparison complete',
      data: context.countryComparisons,
      timestamp: now(),
    };

    // ── STEP 5: Report Generation ──
    yield {
      type: 'step_start',
      step: 5,
      stepName: 'Report Generation',
      message: 'Building compliance report...',
      timestamp: now(),
    };

    try {
      const reportJson = await this.runner.runAgent(
        REPORT_SYSTEM_PROMPT,
        JSON.stringify(context),
        [],
      );

      const reportData = this.safeJsonParse(reportJson);

      // Save to database
      const analysis = await this.prisma.analysis.create({
        data: {
          sessionId: input.sessionId ?? 'anonymous',
          productDesc: input.description,
          originCountry: input.originCountry,
          cifValue: input.cifValue,
          status: 'COMPLETE',
          result: { ...context, report: reportData } as any,
          htsCode,
          totalDutyRate: (context.dutyCalculation as any)?.totalRate,
          totalDutyAmount: (context.dutyCalculation as any)?.totalAmount,
          executionMs: Date.now() - startTime,
        },
      });

      yield {
        type: 'step_complete',
        step: 5,
        stepName: 'Report Generation',
        message: 'Report ready',
        timestamp: now(),
      };
      yield {
        type: 'analysis_complete',
        step: 5,
        stepName: 'Complete',
        message: 'Analysis complete!',
        analysisId: analysis.id,
        timestamp: now(),
      };
    } catch (err) {
      yield {
        type: 'error',
        step: 5,
        stepName: 'Report Generation',
        message: 'Report generation failed',
        error: String(err),
        timestamp: now(),
      };
    }
  }

  private safeJsonParse(text: string): unknown {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
      return JSON.parse(jsonStr);
    } catch {
      return { raw: text };
    }
  }
}

// ── System Prompts ──

const CLASSIFICATION_SYSTEM_PROMPT = `
You are a US Customs and Border Protection licensed customs broker specializing in HTS classification.
Your task: classify the given product under the 10-digit US Harmonized Tariff Schedule code.

Classification methodology (GRI rules):
1. GRI 1: Classify by headings and section/chapter notes first
2. GRI 2: Incomplete/mixtures treated by essential character
3. GRI 3: Most specific description wins; if tie, last in numerical order
4. GRI 6: Apply above rules to subheading level

Use the hts_lookup tool to search the HTS database.
Return ONLY valid JSON:
{
  "code": "XXXX.XX.XX",
  "description": "official HTS description",
  "confidence": 0.0-1.0,
  "rationale": "GRI-based explanation",
  "griReference": "e.g. GRI 1, Chapter 85 Note 3",
  "mfnRate": 0.039,
  "mfnRateText": "3.9%",
  "alternatives": [{"code": "...", "description": "...", "confidence": 0.0}]
}
`.trim();

const DUTY_CALCULATION_SYSTEM_PROMPT = `
You are a US import duty calculation specialist.
Calculate ALL applicable US duty layers for the given HTS code and origin country.

Layers to check in order:
1. MFN (General/Column 1) rate — from the classification data provided
2. Section 301 additional duties — use section301_check tool (China-origin only)
3. Section 232 — applies to steel (HTS 72-73) and aluminum (HTS 76), 25%/10-25%
4. MPF (Merchandise Processing Fee) — 0.3464% of CIF, min $27.75, max $538.40
5. HMF (Harbor Maintenance Fee) — 0.125% of CIF, ocean shipments only

MPF Formula: MAX(27.75, MIN(538.40, cifValue * 0.003464))
HMF Formula: cifValue * 0.00125

Return ONLY valid JSON:
{
  "htsCode": "...",
  "originCountry": "...",
  "cifValue": 10000,
  "layers": [
    {"name": "MFN Base Rate", "rate": 0.039, "rateText": "3.9%", "amount": 390, "basis": "19 U.S.C. § 1202", "applies": true},
    {"name": "Section 301", "rate": 0.25, "rateText": "25%", "amount": 2500, "basis": "Section 301 List 1", "applies": true}
  ],
  "totalRate": 0.294,
  "totalAmount": 2937.14,
  "effectiveRateText": "29.4%"
}
`.trim();

const FTA_SYSTEM_PROMPT = `
You are a Free Trade Agreement specialist.
Use the fta_database_check tool to find preferential rates for all US FTA partners.
Return ONLY valid JSON array of FTA opportunities sorted by savings (highest first):
[
  {"ftaName": "USMCA", "country": "MX", "preferentialRate": 0, "savingsVsMfn": 390, "eligibilityNote": "Must meet USMCA rules of origin"}
]
`.trim();

const COUNTRY_COMPARISON_SYSTEM_PROMPT = `
You are a global sourcing advisor.
Use the country_comparison tool to compare total landed cost across 8 countries.
Return the tool's output directly as JSON.
`.trim();

const REPORT_SYSTEM_PROMPT = `
You are a trade compliance expert writing an executive summary.
Based on all the analysis context provided, generate:
1. A 2-3 sentence executive_summary
2. Top 3 actionable recommendations
3. totalPotentialSavings (max savings vs China baseline in dollars)
4. compliance_notes (2-3 standard disclaimer notes)

Return ONLY valid JSON:
{
  "executive_summary": "...",
  "recommendations": ["...", "...", "..."],
  "totalPotentialSavings": 0,
  "compliance_notes": ["...", "..."]
}
`.trim();
