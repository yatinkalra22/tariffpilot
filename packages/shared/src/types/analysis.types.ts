// ─── Input ──────────────────────────────────────────────────────────────────

export interface ProductInput {
  description: string;
  originCountry: string;      // ISO 2-letter code, default "CN"
  cifValue: number;           // CIF value in USD
  shipmentMode?: 'ocean' | 'air' | 'land';
  sessionId?: string;
}

// ─── HTS Classification ────────────────────────────────────────────────────

export interface HtsClassification {
  code: string;               // e.g. "8518.30.20"
  description: string;
  confidence: number;         // 0-1
  rationale: string;
  griReference: string;       // e.g. "GRI 1, Chapter 85 Note 3"
  alternatives?: Array<{ code: string; description: string; confidence: number }>;
}

// ─── Duty Calculation ─────────────────────────────────────────────────────

export interface DutyLayer {
  name: string;               // e.g. "Section 301 List 1"
  rate: number;               // decimal, e.g. 0.25 for 25%
  rateText: string;           // e.g. "25%"
  amount: number;             // dollar amount on CIF value
  basis: string;              // legal basis reference
  applies: boolean;
}

export interface DutyCalculation {
  htsCode: string;
  originCountry: string;
  cifValue: number;
  layers: DutyLayer[];
  totalRate: number;
  totalAmount: number;
  effectiveRateText: string;  // e.g. "28.9%"
}

// ─── Country Comparison ────────────────────────────────────────────────────

export interface CountryComparison {
  country: string;            // ISO 2-letter
  countryName: string;
  flag: string;               // emoji flag
  totalRate: number;
  totalAmount: number;
  ftaApplies: boolean;
  ftaName?: string;
  savingsVsChina: number;     // dollar savings vs CN origin
  savingsPercent: number;
}

// ─── FTA ────────────────────────────────────────────────────────────────────

export interface FtaOpportunity {
  ftaName: string;            // e.g. "USMCA"
  country: string;
  preferentialRate: number;
  savingsVsMfn: number;
  eligibilityNote: string;    // simplified rules of origin
}

// ─── Full Analysis Result ──────────────────────────────────────────────────

export interface AnalysisResult {
  id: string;
  productDescription: string;
  classification: HtsClassification;
  dutyCalculation: DutyCalculation;
  countryComparisons: CountryComparison[];
  ftaOpportunities: FtaOpportunity[];
  executiveSummary: string;
  recommendations: string[];
  totalPotentialSavings: number;
  executionMs: number;
  createdAt: string;
}

// ─── SSE Events ────────────────────────────────────────────────────────────

export type SseEventType =
  | 'step_start'
  | 'agent_progress'
  | 'tool_call'
  | 'tool_result'
  | 'step_complete'
  | 'analysis_complete'
  | 'error';

export interface SseEvent {
  type: SseEventType;
  step: 1 | 2 | 3 | 4 | 5;
  stepName: string;
  message: string;
  data?: unknown;
  analysisId?: string;
  error?: string;
  timestamp: string;
}
