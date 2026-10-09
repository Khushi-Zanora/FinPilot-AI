import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/finpilot'),
  SESSION_SECRET: z.string().default('finpilot-dev-session-secret-2026'),
  JWT_SECRET: z.string().default('finpilot-dev-jwt-secret-2026'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Razorpay Test
  RAZORPAY_KEY_ID: z.string().default('rzp_test_mock'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret'),
  ENABLE_MOCK_PAYMENTS: z.string().default('true').transform((val) => val === 'true'),

  // AI Service
  AI_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL_NAME: z.string().default('gemini-1.5-flash'),

  // Notifications
  EMAIL_PROVIDER: z.enum(['mock', 'smtp']).default('mock'),
  FROM_EMAIL: z.string().default('noreply@finpilot.app')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
