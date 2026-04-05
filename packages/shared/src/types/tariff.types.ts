export interface HtsCode {
  id: string;
  code: string;
  description: string;
  mfnRate: number | null;
  mfnRateText: string | null;
  specialRates: Record<string, string> | null;
  chapter: number;
  heading: string;
  subheading: string;
  section301List: string | null;
  section301Rate: number | null;
}

export const FTA_PROGRAM_CODES: Record<string, string> = {
  'A':  'Generalized System of Preferences (GSP)',
  'AU': 'US-Australia FTA',
  'CA': 'USMCA (Canada)',
  'CL': 'US-Chile FTA',
  'CO': 'US-Colombia TPA',
  'IL': 'US-Israel FTA',
  'JO': 'US-Jordan FTA',
  'KR': 'US-Korea (KORUS) FTA',
  'MA': 'US-Morocco FTA',
  'MX': 'USMCA (Mexico)',
  'PA': 'US-Panama TPA',
  'PE': 'US-Peru TPA',
  'SG': 'US-Singapore FTA',
};
