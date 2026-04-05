import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentRunnerService } from './agent-runner.service';
import { ToolsModule } from '../tools/tools.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [ToolsModule],
  controllers: [AnalysisController],
  providers: [AgentOrchestratorService, AgentRunnerService, PrismaService],
})
export class AnalysisModule {}
