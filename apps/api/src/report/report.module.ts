import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [ReportController],
  providers: [PdfService, ExcelService, PrismaService],
})
export class ReportModule {}
