import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env relative to this file's directory, then fall back to cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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
  AI_PROVIDER: z.string().default('gemini'),
  AI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  AI_MODEL_NAME: z.string().default('gemini-flash-lite-latest'),

  // Notifications
  EMAIL_PROVIDER: z.enum(['mock', 'smtp']).default('mock'),
  FROM_EMAIL: z.string().default('noreply@finpilot.app')
});

const resolvedApiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
let resolvedMongoUri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finpilot').trim();
if (resolvedMongoUri.includes('<') || resolvedMongoUri.includes('>')) {
  resolvedMongoUri = resolvedMongoUri.replace('://<', '://').replace('>:<', ':').replace('>@', '@');
}

const rawEnv = {
  ...process.env,
  MONGODB_URI: resolvedMongoUri,
  AI_API_KEY: resolvedApiKey,
  GEMINI_API_KEY: resolvedApiKey,
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  AI_MODEL_NAME: process.env.AI_MODEL_NAME || 'gemini-flash-lite-latest'
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  ...parsedEnv.data,
  isAiConfigured: Boolean(resolvedApiKey)
};

