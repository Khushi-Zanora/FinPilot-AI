import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AiProviderError,
  callGeminiAiProvider,
  buildFinancialSystemInstruction,
  logAiDiagnostic,
  INDIAN_INVESTMENT_OPTIONS
} from '../../src/services/aiService.js';
import { config } from '../../src/config/index.js';

// We mock @google/genai for unit testing provider errors and SDK responses
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn(),
    ApiError: class ApiError extends Error {
      constructor(message, status = 400) {
        super(message);
        this.status = status;
      }
    }
  };
});

describe('Gemini AI Provider Unit Tests (Mocked Errors & Success)', () => {
  const originalApiKey = config.GEMINI_API_KEY;
  const originalModel = config.AI_MODEL_NAME;

  beforeEach(() => {
    vi.clearAllMocks();
    config.GEMINI_API_KEY = 'test-mock-gemini-key';
    config.AI_MODEL_NAME = 'gemini-1.5-flash';
  });

  afterEach(() => {
    config.GEMINI_API_KEY = originalApiKey;
    config.AI_MODEL_NAME = originalModel;
  });

  describe('Configuration Validation', () => {
    it('throws 503 AI_NOT_CONFIGURED when API key is missing or empty', async () => {
      config.GEMINI_API_KEY = '';
      config.AI_API_KEY = '';

      await expect(
        callGeminiAiProvider({
          prompt: 'What did I spend?',
          financialContextText: 'Context',
          correlationId: 'test-corr-1'
        })
      ).rejects.toThrowError(AiProviderError);

      try {
        await callGeminiAiProvider({
          prompt: 'Test',
          financialContextText: 'Context',
          correlationId: 'test-corr-1'
        });
      } catch (err) {
        expect(err.statusCode).toBe(503);
        expect(err.code).toBe('AI_NOT_CONFIGURED');
        expect(err.message).toContain('GEMINI_API_KEY');
      }
    });
  });

  describe('Gemini API Error Mapping', () => {
    it('maps 400 / API_KEY_INVALID to 401 AI_INVALID_KEY', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockRejectedValue({
              status: 400,
              message: '{"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}'
            })
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Verified Context',
          correlationId: 'corr-invalid-key'
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('AI_INVALID_KEY');
        expect(err.message).toContain('invalid or unauthorized');
      }
    });

    it('maps 403 / PERMISSION_DENIED to 403 AI_PERMISSION_DENIED', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockRejectedValue({
              status: 403,
              message: 'PERMISSION_DENIED: Method does not allow unregistered callers'
            })
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Context',
          correlationId: 'corr-perm'
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('AI_PERMISSION_DENIED');
      }
    });

    it('maps 404 / NOT_FOUND to 404 AI_MODEL_NOT_FOUND', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockRejectedValue({
              status: 404,
              message: 'models/gemini-1.5-flash is not found'
            })
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Context',
          correlationId: 'corr-model-404'
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('AI_MODEL_NOT_FOUND');
      }
    });

    it('maps 429 / RESOURCE_EXHAUSTED to 429 AI_QUOTA_EXCEEDED', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockRejectedValue({
              status: 429,
              message: 'RESOURCE_EXHAUSTED: Quota exceeded for model'
            })
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Context',
          correlationId: 'corr-quota'
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(429);
        expect(err.code).toBe('AI_QUOTA_EXCEEDED');
      }
    });

    it('maps network timeout to 504 AI_TIMEOUT', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockRejectedValue(new Error('Request timed out after 25000ms'))
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Context',
          correlationId: 'corr-timeout'
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(504);
        expect(err.code).toBe('AI_TIMEOUT');
      }
    });

    it('maps empty generated response to 502 AI_EMPTY_RESPONSE', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: vi.fn().mockResolvedValue({
              text: '   '
            })
          }
        };
      });

      try {
        await callGeminiAiProvider({
          prompt: 'Test prompt',
          financialContextText: 'Context',
          correlationId: 'corr-empty'
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AiProviderError);
        expect(err.statusCode).toBe(502);
        expect(err.code).toBe('AI_EMPTY_RESPONSE');
      }
    });
  });

  describe('Successful Provider Response', () => {
    it('returns genuine Gemini response text with metadata and duration', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: '### Spending Analysis\nYou spent ₹12,000 on Groceries this month.'
      });

      GoogleGenAI.mockImplementation(function () {
        return {
          models: {
            generateContent: mockGenerateContent
          }
        };
      });

      const result = await callGeminiAiProvider({
        prompt: 'Analyze my spending',
        financialContextText: 'User verified context',
        correlationId: 'corr-success-123'
      });

      expect(result.text).toBe('### Spending Analysis\nYou spent ₹12,000 on Groceries this month.');
      expect(result.provider).toBe('gemini');
      expect(result.model).toBe('gemini-1.5-flash');
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('Financial Context System Instruction Builder', () => {
    it('embeds verified calculations and forbids hallucination in prompt instructions', () => {
      const mockContext = {
        totalTrackedCashPaise: 5000000,
        availableCashPaise: 4000000,
        monthlyIncomePaise: 7500000,
        monthlyExpensePaise: 2500000,
        netCashFlowPaise: 5000000,
        surplusAnalysis: {
          emergencyReserveTargetPaise: 7500000,
          investableSurplusPaise: 0,
          hasEmergencyBuffer: false,
          recommendedAction: 'BUILD_EMERGENCY_RESERVE_FIRST'
        },
        categoryBreakdown: [{ category: 'Groceries', formatted: '₹25,000.00', count: 3 }],
        topExpenses: [{ description: 'Supermarket', category: 'Groceries', formatted: '₹15,000.00', date: '01/10/2026' }],
        budgets: [{ category: 'Groceries', budgetedFormatted: '₹30,000.00', spentFormatted: '₹25,000.00', consumedPercentage: 83.3, status: 'WARNING' }],
        goals: [{ name: 'Emergency Fund', targetFormatted: '₹1,00,000.00', currentFormatted: '₹50,000.00', progressPercentage: 50, shortfallFormatted: '₹50,000.00', targetDate: '31/12/2026', monthlyRequiredFormatted: '₹16,667.00' }],
        loans: [],
        recurring: []
      };

      const instruction = buildFinancialSystemInstruction(mockContext);

      expect(instruction).toContain('₹50,000.00');
      expect(instruction).toContain('₹75,000.00');
      expect(instruction).toContain('Groceries');
      expect(instruction).toContain('TRUTHFULNESS & STRICT DATA GROUNDING');
      expect(instruction).toContain('Never invent, hallucinate, or assume');
    });
  });

  describe('Safe Diagnostic Logging', () => {
    it('logs request start, response received, and error without exposing sensitive prompts or keys', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logAiDiagnostic({ event: 'request_start', correlationId: 'diag-1', model: 'gemini-1.5-flash' });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AI-DIAGNOSTIC] correlationId=diag-1'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('event=request_start'));

      logAiDiagnostic({ event: 'response_received', correlationId: 'diag-1', durationMs: 450, model: 'gemini-1.5-flash' });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('durationMs=450'));

      logAiDiagnostic({ event: 'error', correlationId: 'diag-1', durationMs: 200, errorCode: 401, errorType: 'API_KEY_INVALID' });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('errorCode=401'));

      logSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });
});
