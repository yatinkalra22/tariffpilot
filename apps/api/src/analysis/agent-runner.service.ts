import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmService } from '../llm/llm.service';

export interface ToolDefinition {
  schema: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  };
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface AgentEvent {
  type: 'tool_call' | 'tool_result' | 'thinking';
  toolName?: string;
  message: string;
}

@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(private llm: LlmService) {}

  async runAgent(
    systemPrompt: string,
    userMessage: string,
    tools: ToolDefinition[],
    onEvent?: (event: AgentEvent) => void,
    maxIterations = 10,
  ): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const toolMap = new Map(
      tools.map((t) => [t.schema.function.name, t.execute]),
    );

    const toolSchemas = tools.map((t) => t.schema) as OpenAI.ChatCompletionTool[];

    for (let i = 0; i < maxIterations; i++) {
      const response = await this.llm.client.chat.completions.create({
        model: this.llm.model,
        messages,
        ...(tools.length > 0
          ? { tools: toolSchemas, tool_choice: 'auto' as const }
          : {}),
        max_tokens: 8192,
        temperature: 0.1,
      });

      const msg = response.choices[0].message;
      messages.push(msg);

      // No tool calls = final response
      if (!msg.tool_calls?.length) {
        return msg.content ?? '';
      }

      // Execute all tool calls in this round
      for (const tc of msg.tool_calls) {
        const fn = (tc as any).function;
        const toolName: string = fn.name;
        onEvent?.({
          type: 'tool_call',
          toolName,
          message: `Calling ${toolName}...`,
        });
        this.logger.debug(`Tool call: ${toolName}(${fn.arguments})`);

        let result: string;
        try {
          const executor = toolMap.get(toolName);
          if (!executor) throw new Error(`Unknown tool: ${toolName}`);
          const args = JSON.parse(fn.arguments);
          result = await executor(args);
        } catch (err) {
          result = JSON.stringify({ error: String(err) });
        }

        onEvent?.({
          type: 'tool_result',
          toolName,
          message: `${toolName} complete`,
        });

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        });
      }
    }

    throw new Error('Agent max iterations reached');
  }
}
