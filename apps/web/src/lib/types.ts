export interface ProductInput {
  description: string;
  originCountry: string;
  cifValue: number;
  sessionId?: string;
}

export type SseEventType =
  | "step_start"
  | "agent_progress"
  | "tool_call"
  | "tool_result"
  | "step_complete"
  | "analysis_complete"
  | "error";

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

export interface AnalysisResult {
  id: string;
  productDesc: string;
  originCountry: string;
  cifValue: number;
  status: string;
  result: {
    classification?: {
      code: string;
      description: string;
      confidence: number;
      rationale: string;
      griReference?: string;
      mfnRate?: number;
      mfnRateText?: string;
      alternatives?: Array<{
        code: string;
        description: string;
        confidence: number;
      }>;
    };
    dutyCalculation?: {
      htsCode: string;
      originCountry: string;
      cifValue: number;
      layers: Array<{
        name: string;
        rate: number;
        rateText: string;
        amount: number;
        basis: string;
        applies: boolean;
      }>;
      totalRate: number;
      totalAmount: number;
      effectiveRateText: string;
    };
    countryComparisons?: Array<{
      country: string;
      countryName: string;
      flag: string;
      totalRate: number;
      totalAmount: number;
      ftaApplies: boolean;
      ftaName?: string;
      savingsVsChina: number;
      savingsPercent: number;
    }>;
    ftaOpportunities?: unknown;
    report?: {
      executive_summary: string;
      recommendations: string[];
      totalPotentialSavings: number;
      compliance_notes: string[];
    };
  };
  htsCode: string;
  totalDutyRate: number;
  totalDutyAmount: number;
  createdAt: string;
}
