import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  public readonly client: OpenAI;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('ZAI_API_KEY'),
      baseURL: 'https://api.z.ai/api/paas/v4/',
    });
  }

  get model(): string {
    return this.config.get<string>('GLM_MODEL', 'glm-5');
  }
}
