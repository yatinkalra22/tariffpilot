import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async generate(analysis: any): Promise<Buffer> {
    const result = analysis.result || {};
    const duty = result.dutyCalculation || {};
    const classification = result.classification || {};
    const comparisons = result.countryComparisons || [];
    const report = result.report || {};

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TariffPilot AI';

    // Sheet 1: Summary
    const summary = workbook.addWorksheet('Summary');
    summary.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 40 },
    ];

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A5F' },
      },
    };

    summary.getRow(1).eachCell((cell: ExcelJS.Cell) => {
      Object.assign(cell.style, headerStyle);
    });

    summary.addRow({ field: 'Product', value: analysis.productDesc });
    summary.addRow({ field: 'Origin Country', value: analysis.originCountry });
    summary.addRow({
      field: 'CIF Value',
      value: `$${Number(analysis.cifValue).toLocaleString()}`,
    });
    summary.addRow({
      field: 'HTS Code',
      value: classification.code || analysis.htsCode,
    });
    summary.addRow({
      field: 'HTS Description',
      value: classification.description || '',
    });
    summary.addRow({
      field: 'Total Duty Rate',
      value: duty.effectiveRateText || '',
    });
    summary.addRow({
      field: 'Total Duty Amount',
      value: `$${(duty.totalAmount || 0).toFixed(2)}`,
    });
    summary.addRow({
      field: 'Max Potential Savings',
      value: `$${(report.totalPotentialSavings || 0).toLocaleString()}`,
    });
    summary.addRow({
      field: 'Executive Summary',
      value: report.executive_summary || '',
    });

    // Sheet 2: Duty Breakdown
    const dutySheet = workbook.addWorksheet('Duty Breakdown');
    dutySheet.columns = [
      { header: 'Duty Layer', key: 'name', width: 30 },
      { header: 'Rate', key: 'rate', width: 15 },
      { header: 'Amount (USD)', key: 'amount', width: 20 },
      { header: 'Applies', key: 'applies', width: 10 },
    ];

    dutySheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
      Object.assign(cell.style, headerStyle);
    });

    for (const layer of duty.layers || []) {
      const row = dutySheet.addRow({
        name: layer.name,
        rate: layer.rateText,
        amount: layer.amount,
        applies: layer.applies ? 'Yes' : 'No',
      });

      if (!layer.applies) {
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.font = { color: { argb: 'FF9CA3AF' } };
        });
      }
    }

    // Total row
    const totalRow = dutySheet.addRow({
      name: 'TOTAL',
      rate: duty.effectiveRateText || '',
      amount: duty.totalAmount || 0,
      applies: '',
    });
    totalRow.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: 'FFEF4444' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' },
      };
    });

    // Sheet 3: Country Comparison
    if (comparisons.length > 0) {
      const countrySheet = workbook.addWorksheet('Country Comparison');
      countrySheet.columns = [
        { header: 'Country', key: 'country', width: 20 },
        { header: 'Total Rate', key: 'rate', width: 15 },
        { header: 'Total Duty (USD)', key: 'amount', width: 20 },
        { header: 'FTA', key: 'fta', width: 15 },
        { header: 'Savings vs China', key: 'savings', width: 20 },
      ];

      countrySheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
        Object.assign(cell.style, headerStyle);
      });

      for (const c of comparisons) {
        const row = countrySheet.addRow({
          country: `${c.countryName || c.country}`,
          rate: `${((c.totalRate || 0) * 100).toFixed(1)}%`,
          amount: c.totalAmount || 0,
          fta: c.ftaName || (c.ftaApplies ? 'Yes' : 'No'),
          savings: c.savingsVsChina > 0 ? c.savingsVsChina : 0,
        });

        if (c.savingsVsChina > 0) {
          row.getCell('savings').font = { color: { argb: 'FF10B981' }, bold: true };
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
