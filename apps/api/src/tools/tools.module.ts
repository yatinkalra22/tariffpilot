import { Module } from '@nestjs/common';
import { HtsLookupTool } from './hts-lookup.tool';
import { Section301Tool } from './section301.tool';
import { FtaDatabaseTool } from './fta-database.tool';
import { CountryComparisonTool } from './country-comparison.tool';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [
    PrismaService,
    HtsLookupTool,
    Section301Tool,
    FtaDatabaseTool,
    CountryComparisonTool,
  ],
  exports: [HtsLookupTool, Section301Tool, FtaDatabaseTool, CountryComparisonTool],
})
export class ToolsModule {}
