import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../analysis/agent-runner.service';

// Section 301 tariff data from USTR published lists
const SECTION_301_CHAPTERS: Record<number, { list: string; rate: number }> = {
  84: { list: 'List1', rate: 0.25 }, // Machinery
  85: { list: 'List1', rate: 0.25 }, // Electronics
  87: { list: 'List1', rate: 0.25 }, // Vehicles
  73: { list: 'List1', rate: 0.25 }, // Steel articles
  76: { list: 'List2', rate: 0.25 }, // Aluminum articles
  39: { list: 'List3', rate: 0.25 }, // Plastics
  61: { list: 'List3', rate: 0.25 }, // Knit apparel
  62: { list: 'List3', rate: 0.25 }, // Woven apparel
  94: { list: 'List3', rate: 0.25 }, // Furniture
  95: { list: 'List4A', rate: 0.075 }, // Toys
  64: { list: 'List4A', rate: 0.075 }, // Footwear
  42: { list: 'List4A', rate: 0.075 }, // Leather goods
};

@Injectable()
export class Section301Tool {
  getDefinition(): ToolDefinition {
    return {
      schema: {
        type: 'function',
        function: {
          name: 'section301_check',
          description:
            'Check if a product is subject to Section 301 additional tariffs (China-origin goods).',
          parameters: {
            type: 'object',
            properties: {
              htsCode: {
                type: 'string',
                description: '10-digit HTS code',
              },
              originCountry: {
                type: 'string',
                description: 'ISO country code, e.g. CN',
              },
            },
            required: ['htsCode', 'originCountry'],
          },
        },
      },
      execute: async (args) => {
        const { htsCode, originCountry } = args as {
          htsCode: string;
          originCountry: string;
        };

        if (originCountry !== 'CN') {
          return JSON.stringify({
            applies: false,
            reason: 'Section 301 only applies to China-origin goods',
          });
        }

        const chapter = parseInt(htsCode.replace(/\./g, '').substring(0, 2));
        const listData = SECTION_301_CHAPTERS[chapter];

        if (!listData) {
          return JSON.stringify({
            applies: false,
            note: 'No Section 301 tariff found for this chapter. Verify with CBP.',
          });
        }

        return JSON.stringify({
          applies: true,
          list: listData.list,
          additionalRate: listData.rate,
          additionalRateText: `${listData.rate * 100}%`,
          basis: `USTR Section 301 ${listData.list}`,
          note: 'Rate applies to goods originating from China (CN)',
        });
      },
    };
  }
}
