import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ToolDefinition } from '../analysis/agent-runner.service';

const COUNTRIES = [
  { code: 'CN', name: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'VN', name: 'Vietnam', flag: '\u{1F1FB}\u{1F1F3}' },
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', fta: 'USMCA' },
  { code: 'TH', name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
  { code: 'TW', name: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}' },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', fta: 'KORUS' },
  { code: 'ID', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
];

// Section 301 only applies to China
const S301_CHAPTERS = new Set([84, 85, 87, 73, 76, 39, 61, 62, 94, 95, 64, 42]);

@Injectable()
export class CountryComparisonTool {
  constructor(private prisma: PrismaService) {}

  getDefinition(): ToolDefinition {
    return {
      schema: {
        type: 'function',
        function: {
          name: 'country_comparison',
          description:
            'Compare total US import duty for the same HTS code across 8 source countries.',
          parameters: {
            type: 'object',
            properties: {
              htsCode: {
                type: 'string',
                description: 'HTS code to compare',
              },
              mfnRate: {
                type: 'number',
                description: 'MFN rate as decimal (e.g. 0.039 for 3.9%)',
              },
              cifValue: {
                type: 'number',
                description: 'CIF value in USD',
              },
            },
            required: ['htsCode', 'mfnRate', 'cifValue'],
          },
        },
      },
      execute: async (args) => {
        const { htsCode, mfnRate, cifValue } = args as {
          htsCode: string;
          mfnRate: number;
          cifValue: number;
        };

        const chapter = parseInt(htsCode.replace(/\./g, '').substring(0, 2));
        const hasS301 = S301_CHAPTERS.has(chapter);

        const results = COUNTRIES.map((c) => {
          const s301Rate = c.code === 'CN' && hasS301 ? 0.25 : 0;
          const ftaRate = c.fta ? 0 : mfnRate;
          const totalRate = ftaRate + s301Rate;
          const totalAmount = cifValue * totalRate;
          const chinaRate = mfnRate + (hasS301 ? 0.25 : 0);
          const chinaAmount = cifValue * chinaRate;

          return {
            country: c.code,
            countryName: c.name,
            flag: c.flag,
            totalRate,
            totalAmount: Math.round(totalAmount * 100) / 100,
            ftaApplies: !!c.fta,
            ftaName: c.fta || null,
            savingsVsChina:
              Math.round((chinaAmount - totalAmount) * 100) / 100,
            savingsPercent:
              chinaAmount > 0
                ? Math.round(
                    ((chinaAmount - totalAmount) / chinaAmount) * 10000,
                  ) / 100
                : 0,
          };
        });

        return JSON.stringify(
          results.sort((a, b) => a.totalRate - b.totalRate),
        );
      },
    };
  }
}
