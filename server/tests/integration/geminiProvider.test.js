import { describe, it, expect } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import { config } from '../../src/config/index.js';
import { callGeminiAiProvider } from '../../src/services/aiService.js';

describe('REAL Google Gemini Provider Integration Tests (Unmocked)', () => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const hasLiveKey = Boolean(apiKey && apiKey.length > 5);

  if (!hasLiveKey) {
    it.skip('Live Gemini request skipped: GEMINI_API_KEY is not configured in environment variables', () => {
      // Skipped gracefully when running in CI or without live credentials.
      // Set GEMINI_API_KEY in server/.env to execute live provider verification.
      expect(true).toBe(true);
    });
    return;
  }

  it('makes a real live API call to Google Gemini API using @google/genai SDK', async () => {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 30000 }
    });

    const model = config.AI_MODEL_NAME || 'gemini-flash-lite-latest';
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model,
      contents: 'Provide a single sentence financial tip for an emergency reserve in Indian Rupees (INR).',
      config: {
        temperature: 0.2
      }
    });

    const durationMs = Date.now() - startTime;

    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
    expect(typeof response.text).toBe('string');
    expect(response.text.trim().length).toBeGreaterThan(10);
    expect(durationMs).toBeGreaterThan(0);
  });

  it('genuinely executes callGeminiAiProvider with financial context grounding and returns provider metadata', async () => {
    const prompt = 'Can I afford an expenditure of ₹25,000 this month?';
    const financialContextText = `
[VERIFIED USER FINANCIAL CONTEXT]
- Total Tracked Liquid Cash: ₹1,50,000.00
- Available Uncommitted Cash: ₹80,000.00
- Monthly Net Cash Flow: ₹30,000.00
`;

    const result = await callGeminiAiProvider({
      prompt,
      financialContextText,
      correlationId: `integration-live-${Date.now()}`
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.text.length).toBeGreaterThan(15);
    expect(result.provider).toBe('gemini');
    expect(result.model).toBe(config.AI_MODEL_NAME || 'gemini-1.5-flash');
    expect(result.durationMs).toBeGreaterThan(0);
  });
});
