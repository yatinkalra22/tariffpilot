import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolDefinition } from '../analysis/agent-runner.service';

// Hardcoded FTA data for hackathon (ITA API fallback)
const FTA_DATA: Record<string, { ftaName: string; preferentialRate: number }> =
  {
    MX: { ftaName: 'USMCA', preferentialRate: 0 },
    CA: { ftaName: 'USMCA', preferentialRate: 0 },
    KR: { ftaName: 'KORUS', preferentialRate: 0 },
    AU: { ftaName: 'US-Australia FTA', preferentialRate: 0 },
    SG: { ftaName: 'US-Singapore FTA', preferentialRate: 0 },
    CL: { ftaName: 'US-Chile FTA', preferentialRate: 0 },
    PE: { ftaName: 'US-Peru TPA', preferentialRate: 0 },
    CO: { ftaName: 'US-Colombia TPA', preferentialRate: 0 },
    PA: { ftaName: 'US-Panama TPA', preferentialRate: 0 },
    IL: { ftaName: 'US-Israel FTA', preferentialRate: 0 },
    JO: { ftaName: 'US-Jordan FTA', preferentialRate: 0 },
    MA: { ftaName: 'US-Morocco FTA', preferentialRate: 0 },
  };

@Injectable()
export class FtaDatabaseTool {
  constructor(private config: ConfigService) {}

  getDefinition(): ToolDefinition {
    return {
      schema: {
        type: 'function',
        function: {
          name: 'fta_database_check',
          description:
            'Check FTA preferential rates for a given HTS code across US FTA partner countries.',
          parameters: {
            type: 'object',
            properties: {
              htsCode: {
                type: 'string',
                description: '10-digit HTS code',
              },
              countries: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Optional: specific countries to check. Defaults to all US FTA partners.',
              },
            },
            required: ['htsCode'],
          },
        },
      },
      execute: async (args) => {
        const { htsCode, countries } = args as {
          htsCode: string;
          countries?: string[];
        };

        const checkCountries = countries || Object.keys(FTA_DATA);

        const ftaRates = checkCountries
          .map((c) => {
            const fta = FTA_DATA[c];
            if (!fta) return null;
            return {
              country: c,
              ftaName: fta.ftaName,
              preferentialRate: fta.preferentialRate,
              ruleOfOriginText: `Product must originate in ${c} per ${fta.ftaName} rules of origin`,
            };
          })
          .filter(Boolean);

        return JSON.stringify({ ftaRates, htsCode });
      },
    };
  }
}
