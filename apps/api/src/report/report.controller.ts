import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { PrismaService } from '../database/prisma.service';

@Controller('report')
export class ReportController {
  constructor(
    private pdf: PdfService,
    private excel: ExcelService,
    private prisma: PrismaService,
  ) {}

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const analysis = await this.prisma.analysis.findUnique({ where: { id } });
    if (!analysis) return res.status(404).send('Not found');

    const buffer = await this.pdf.generate(analysis);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tariffpilot-${id}.pdf"`,
    );
    res.send(buffer);
  }

  @Get(':id/excel')
  async downloadExcel(@Param('id') id: string, @Res() res: Response) {
    const analysis = await this.prisma.analysis.findUnique({ where: { id } });
    if (!analysis) return res.status(404).send('Not found');

    const buffer = await this.excel.generate(analysis);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tariffpilot-${id}.xlsx"`,
    );
    res.send(buffer);
  }
}
