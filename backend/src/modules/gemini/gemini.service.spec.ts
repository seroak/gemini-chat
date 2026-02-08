import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  const createMockConfigService = (apiKey?: string, model?: string): ConfigService => {
    return {
      get: jest.fn((key: string) => {
        if (key === 'GEMINI_API_KEY') return apiKey;
        if (key === 'GEMINI_MODEL') return model;
        return undefined;
      }),
    } as unknown as ConfigService;
  };

  describe('생성자', () => {
    it('Gemini API 키가 없으면 에러를 던진다', () => {
      const configService = createMockConfigService(undefined);
      expect(() => new GeminiService(configService)).toThrow(
        'GEMINI_API_KEY is not defined in environment variables',
      );
    });

    it('Gemini API 키가 있으면 서비스를 생성한다', () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);
      expect(service).toBeDefined();
    });
  });

  describe('generateContent', () => {
    it('주어진 프롬프트로 텍스트를 생성한다', async () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);
      const prompt = '안녕하세요';

      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '안녕하세요! 무엇을 도와드릴까요?',
      });

      // Mock client structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).client = {
        models: {
          generateContent: mockGenerateContent,
        },
      };

      const result = await service.generateContent(prompt);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });
      expect(result).toBe('안녕하세요! 무엇을 도와드릴까요?');
    });

    it('API 호출 실패 시 에러를 던진다', async () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);

      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error'));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).client = {
        models: {
          generateContent: mockGenerateContent,
        },
      };

      await expect(service.generateContent('테스트')).rejects.toThrow(
        'Failed to generate content from Gemini API',
      );
    });
  });

  describe('generateContentStream', () => {
    it('스트리밍 방식으로 텍스트를 생성한다', async () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);

      async function* mockStream() {
        yield { text: '안녕' };
        yield { text: '하세요' };
        yield { text: '!' };
      }

      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockStream());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).client = {
        models: {
          generateContentStream: mockGenerateContentStream,
        },
      };

      const stream = service.generateContentStream('안녕하세요');
      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(mockGenerateContentStream).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp',
        contents: [
          {
            role: 'user',
            parts: [{ text: '안녕하세요' }],
          },
        ],
      });
      expect(chunks).toEqual(['안녕', '하세요', '!']);
    });
  });

  describe('startChat', () => {
    it('대화 히스토리와 함께 채팅을 시작한다', async () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);

      const history = [
        { role: 'user' as const, parts: [{ text: '안녕하세요' }] },
        { role: 'model' as const, parts: [{ text: '안녕하세요! 무엇을 도와드릴까요?' }] },
      ];

      async function* mockStream() {
        yield { text: 'TypeScript는' };
        yield { text: ' 정적 타입 언어입니다.' };
      }

      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockStream());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).client = {
        models: {
          generateContentStream: mockGenerateContentStream,
        },
      };

      const stream = service.startChat('TypeScript에 대해 알려줘', history);
      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(mockGenerateContentStream).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: 'TypeScript에 대해 알려줘' }] },
        ],
      });
      expect(chunks).toEqual(['TypeScript는', ' 정적 타입 언어입니다.']);
    });

    it('빈 히스토리로도 채팅을 시작할 수 있다', async () => {
      const configService = createMockConfigService('test-api-key', 'gemini-2.0-flash-exp');
      const service = new GeminiService(configService);

      async function* mockStream() {
        yield { text: '안녕하세요!' };
      }

      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockStream());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).client = {
        models: {
          generateContentStream: mockGenerateContentStream,
        },
      };

      const stream = service.startChat('안녕하세요');
      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(mockGenerateContentStream).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp',
        contents: [
          { role: 'user', parts: [{ text: '안녕하세요' }] },
        ],
      });
      expect(chunks).toEqual(['안녕하세요!']);
    });
  });
});
