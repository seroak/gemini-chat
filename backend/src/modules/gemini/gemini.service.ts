import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from './dto/generate-content.dto';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash-exp';
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * 단순 텍스트 생성 (비스트리밍)
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });
      return result.text || '';
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate content from Gemini API',
        error.message,
      );
    }
  }

  /**
   * 스트리밍 방식으로 텍스트 생성
   */
  async *generateContentStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate streaming content from Gemini API',
        error.message,
      );
    }
  }

  /**
   * 멀티턴 대화 (히스토리 포함, 스트리밍)
   */
  async *startChat(prompt: string, history: ChatMessage[] = []): AsyncGenerator<string> {
    try {
      // 새로운 SDK에서는 history와 현재 프롬프트를 contents 배열로 합쳐서 전달합니다.
      const contents = [
        ...history,
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ];

      const result = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: contents,
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send chat message to Gemini API',
        error.message,
      );
    }
  }

  /**
   * 멀티턴 대화 (히스토리 포함, 비스트리밍) — 전체 응답 문자열 반환
   */
  async generateChatResponse(prompt: string, history: ChatMessage[] = []): Promise<string> {
    try {
      let fullText = '';
      for await (const chunk of this.startChat(prompt, history)) {
        fullText += chunk;
      }
      return fullText;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate chat response from Gemini API',
        (error as Error).message,
      );
    }
  }
}
