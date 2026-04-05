export interface ProductInput {
  description: string;
  originCountry: string;
  cifValue: number;
  shipmentMode?: 'ocean' | 'air' | 'land';
  sessionId?: string;
}

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
