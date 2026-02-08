import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ChatMessage } from './dto/generate-content.dto';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash-exp';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  /**
   * 단순 텍스트 생성 (비스트리밍)
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
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
      const result = await this.model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
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
      const chat = this.model.startChat({
        history: history,
      });

      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
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
