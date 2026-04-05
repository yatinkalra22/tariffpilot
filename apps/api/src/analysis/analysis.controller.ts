import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { PrismaService } from '../database/prisma.service';
import type { ProductInput } from './types';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private orchestrator: AgentOrchestratorService,
    private prisma: PrismaService,
  ) {}

  @Post('stream')
  @HttpCode(200)
  async streamAnalysis(@Body() body: ProductInput, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const event of this.orchestrator.runAnalysis(body)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          step: 1,
          stepName: 'Error',
          message: 'Analysis failed. Please try again.',
          error: String(err),
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    } finally {
      res.end();
    }
  }

  @Get(':id')
  async getAnalysis(@Param('id') id: string) {
    return this.prisma.analysis.findUnique({ where: { id } });
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.prisma.analysis.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        productDesc: true,
        htsCode: true,
        totalDutyRate: true,
        totalDutyAmount: true,
        createdAt: true,
        status: true,
      },
    });
  }
}
