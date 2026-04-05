import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake');

const FONTS = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

const BRAND_DARK = '#1E3A5F';
const BRAND_BLUE = '#288CFA';

@Injectable()
export class PdfService {
  private printer = new PdfPrinter(FONTS);

  async generate(analysis: any): Promise<Buffer> {
    const result = analysis.result || {};
    const duty = result.dutyCalculation || {};
    const classification = result.classification || {};
    const comparisons = result.countryComparisons || [];
    const report = result.report || {};

    const dutyLayers = (duty.layers || [])
      .filter((l: any) => l.applies)
      .map((l: any) => [
        l.name || '',
        { text: l.rateText || '', alignment: 'right' },
        {
          text: `$${(l.amount || 0).toFixed(2)}`,
          alignment: 'right',
        },
      ]);

    const countryRows = comparisons.map((c: any) => [
      `${c.flag || ''} ${c.countryName || c.country || ''}`,
      { text: `${((c.totalRate || 0) * 100).toFixed(1)}%`, alignment: 'right' },
      {
        text: `$${(c.totalAmount || 0).toLocaleString()}`,
        alignment: 'right',
      },
      {
        text: c.savingsVsChina > 0 ? `-$${c.savingsVsChina.toLocaleString()}` : '—',
        alignment: 'right',
        color: c.savingsVsChina > 0 ? '#10B981' : '#6B7280',
      },
    ]);

    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica', fontSize: 10, color: '#374151' },
      content: [
        // Cover
        {
          text: 'TariffPilot AI',
          fontSize: 12,
          color: BRAND_BLUE,
          bold: true,
        },
        {
          text: 'Trade Compliance Report',
          fontSize: 20,
          bold: true,
          color: BRAND_DARK,
          margin: [0, 0, 0, 5],
        },
        {
          text: analysis.productDesc || '',
          fontSize: 12,
          color: '#6B7280',
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 2,
              lineColor: BRAND_BLUE,
            },
          ],
        },
        { text: '\n' },

        // KPIs
        {
          columns: [
            {
              text: [
                { text: 'HTS Code\n', fontSize: 9, color: '#6B7280' },
                {
                  text: classification.code || analysis.htsCode || '—',
                  fontSize: 16,
                  bold: true,
                  color: BRAND_DARK,
                },
              ],
            },
            {
              text: [
                { text: 'Total Duty Rate\n', fontSize: 9, color: '#6B7280' },
                {
                  text: duty.effectiveRateText || '—',
                  fontSize: 16,
                  bold: true,
                  color: '#EF4444',
                },
              ],
            },
            {
              text: [
                { text: 'Duty Amount\n', fontSize: 9, color: '#6B7280' },
                {
                  text: `$${(duty.totalAmount || 0).toLocaleString()}`,
                  fontSize: 16,
                  bold: true,
                  color: '#EF4444',
                },
              ],
            },
            {
              text: [
                { text: 'Max Savings\n', fontSize: 9, color: '#6B7280' },
                {
                  text: `$${(report.totalPotentialSavings || 0).toLocaleString()}`,
                  fontSize: 16,
                  bold: true,
                  color: '#10B981',
                },
              ],
            },
          ],
          margin: [0, 10, 0, 20],
        },

        // Classification
        {
          text: '1. HTS Classification',
          fontSize: 14,
          bold: true,
          color: BRAND_DARK,
          margin: [0, 15, 0, 5],
        },
        {
          text: classification.description || '',
          margin: [0, 0, 0, 5],
        },
        {
          text: [
            { text: 'Rationale: ', bold: true },
            classification.rationale || '',
          ],
        },
        { text: '\n' },

        // Duty Breakdown
        {
          text: '2. Duty Stack Breakdown',
          fontSize: 14,
          bold: true,
          color: BRAND_DARK,
          margin: [0, 15, 0, 5],
        },
        ...(dutyLayers.length > 0
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: ['*', 60, 80],
                  body: [
                    [
                      {
                        text: 'Duty Layer',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                      },
                      {
                        text: 'Rate',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                        alignment: 'right',
                      },
                      {
                        text: 'Amount',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                        alignment: 'right',
                      },
                    ],
                    ...dutyLayers,
                    [
                      { text: 'Total', bold: true, fillColor: '#F9FAFB' },
                      {
                        text: duty.effectiveRateText || '',
                        bold: true,
                        alignment: 'right',
                        fillColor: '#F9FAFB',
                      },
                      {
                        text: `$${(duty.totalAmount || 0).toFixed(2)}`,
                        bold: true,
                        alignment: 'right',
                        color: '#EF4444',
                        fillColor: '#F9FAFB',
                      },
                    ],
                  ],
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 15],
              },
            ]
          : [{ text: 'No duty data available', color: '#9CA3AF' }]),

        // Country Comparison
        ...(countryRows.length > 0
          ? [
              {
                text: '3. Country Comparison',
                fontSize: 14,
                bold: true,
                color: BRAND_DARK,
                margin: [0, 15, 0, 5],
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', 50, 70, 70],
                  body: [
                    [
                      {
                        text: 'Country',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                      },
                      {
                        text: 'Rate',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                        alignment: 'right',
                      },
                      {
                        text: 'Amount',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                        alignment: 'right',
                      },
                      {
                        text: 'Savings',
                        bold: true,
                        fillColor: BRAND_DARK,
                        color: 'white',
                        fontSize: 9,
                        alignment: 'right',
                      },
                    ],
                    ...countryRows,
                  ],
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 15],
              },
            ]
          : []),

        // Recommendations
        ...(report.recommendations?.length > 0
          ? [
              {
                text: '4. Recommendations',
                fontSize: 14,
                bold: true,
                color: BRAND_DARK,
                margin: [0, 15, 0, 5],
              },
              ...report.recommendations.map((r: string, i: number) => ({
                text: `${i + 1}. ${r}`,
                margin: [0, 0, 0, 5] as [number, number, number, number],
              })),
            ]
          : []),

        // Disclaimer
        { text: '\n' },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#E5E7EB',
            },
          ],
        },
        {
          text: 'DISCLAIMER: This report is generated by AI for informational purposes only and does not constitute legal or customs advice. Always verify classification with a licensed customs broker.',
          fontSize: 8,
          color: '#9CA3AF',
          margin: [0, 8, 0, 0],
        },
        {
          text: `Analysis ID: ${analysis.id} | Generated: ${new Date().toISOString()}`,
          fontSize: 8,
          color: '#9CA3AF',
        },
      ],
    };

    return new Promise<Buffer>((resolve) => {
      const doc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  }
}
