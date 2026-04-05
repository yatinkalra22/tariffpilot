import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ToolDefinition } from '../analysis/agent-runner.service';

@Injectable()
export class HtsLookupTool {
  constructor(private prisma: PrismaService) {}

  getDefinition(): ToolDefinition {
    return {
      schema: {
        type: 'function',
        function: {
          name: 'hts_lookup',
          description:
            'Search for HTS codes matching a product description. Returns top matches with rates.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Product description or keywords to search',
              },
              chapter: {
                type: 'number',
                description:
                  'Optional: specific HTS chapter (1-99) to narrow search',
              },
            },
            required: ['query'],
          },
        },
      },
      execute: async (args) => {
        const { query, chapter } = args as {
          query: string;
          chapter?: number;
        };

        // Split query into keywords for broader matching
        const keywords = query
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2);

        const results = await this.prisma.htsCode.findMany({
          where: {
            AND: [
              ...(chapter ? [{ chapter }] : []),
              {
                OR: keywords.map((kw) => ({
                  description: { contains: kw, mode: 'insensitive' as const },
                })),
              },
            ],
          },
          take: 10,
          select: {
            code: true,
            description: true,
            mfnRateText: true,
            mfnRate: true,
            section301List: true,
            section301Rate: true,
            chapter: true,
            heading: true,
          },
        });

        if (results.length === 0) {
          // Fallback: try first keyword only
          const fallback = await this.prisma.htsCode.findMany({
            where: {
              description: {
                contains: keywords[0] || query,
                mode: 'insensitive',
              },
            },
            take: 10,
            select: {
              code: true,
              description: true,
              mfnRateText: true,
              mfnRate: true,
              section301List: true,
              section301Rate: true,
              chapter: true,
              heading: true,
            },
          });
          return JSON.stringify(fallback);
        }

        return JSON.stringify(results);
      },
    };
  }
}
