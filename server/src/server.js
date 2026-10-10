import dns from 'dns';

// Ensure SRV records for mongodb+srv:// resolve reliably on Windows / restrictive ISP DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { processDueRecurringTransactions } from './services/recurringEngine.js';

function maskMongoUri(uri) {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
}

async function startServer() {
  let mongoMemoryServerInstance = null;
  let recurringJobInterval = null;

  try {
    let mongoUri = config.MONGODB_URI;

    // Detect and sanitize accidental angle brackets from template strings (e.g. <username>:<password>)
    if (mongoUri.includes('<') || mongoUri.includes('>')) {
      console.warn('⚠️ Warning: MONGODB_URI contains placeholder angle brackets (< or >). Sanitizing automatically...');
      mongoUri = mongoUri.replace('://<', '://').replace('>:<', ':').replace('>@', '@');
    }

    const isAtlasOrRemote = mongoUri.startsWith('mongodb+srv://') || (!mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost'));
    const isExplicitlyConfigured = Boolean(process.env.MONGODB_URI);

    // Configure public DNS resolvers for mongodb+srv on Windows if needed
    if (mongoUri.startsWith('mongodb+srv://')) {
      try {
        const dns = await import('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (_) {
        // Continue with system resolver if setServers fails
      }
    }

    try {
      console.log(`Connecting to MongoDB at ${maskMongoUri(mongoUri)}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000, maxPoolSize: 2 });
      console.log('✅ Connected to MongoDB Atlas/Database successfully.');
    } catch (dbErr) {
      if (isAtlasOrRemote || isExplicitlyConfigured) {
        console.error('\n❌ CRITICAL: Failed to connect to MongoDB Atlas / Remote Database at:', maskMongoUri(mongoUri));
        console.error('Error Code:', dbErr.code || dbErr.name || 'CONNECTION_FAILED');
        console.error('Error Message:', dbErr.message);
        console.error('\nActionable Troubleshooting Steps:');
        console.error('1. Check MONGODB_URI in server/.env: verify username and password are correct and special characters are URL-encoded.');
        console.error('2. Ensure angle brackets (< and >) are NOT included around the username or password.');
        console.error('3. Check MongoDB Atlas -> Network Access: ensure your current IP address (or 0.0.0.0/0 for development) is added to the IP Access List.');
        console.error('4. Check MongoDB Atlas -> Database Access: ensure the database user exists and has readWrite permissions.');
        console.error('\nServer startup aborted to prevent silent fallback to ephemeral in-memory storage.\n');
        process.exit(1);
      }

        if (config.NODE_ENV !== 'production') {
          console.warn('⚠️ Local MongoDB not detected and no remote URI configured. Initializing in-memory MongoDB server for development...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongoMemoryServerInstance = await MongoMemoryServer.create();
          mongoUri = mongoMemoryServerInstance.getUri();
          await mongoose.connect(mongoUri);
          console.log('✅ In-memory MongoDB connected successfully at:', mongoUri);
        } else {
          throw dbErr;
        }
      }

    // Auto-seed default testing account in development if not present
    if (config.NODE_ENV !== 'production') {
      try {
        const { User } = await import('./models/User.js');
        const { Subscription } = await import('./models/Subscription.js');
        const testEmail = 'premium.tester@finpilot.app';
        let testUser = await User.findOne({ email: testEmail });
        if (!testUser) {
          const passwordHash = await User.hashPassword('FinPilot2026!');
          testUser = await User.create({
            name: 'Premium Test User',
            email: testEmail,
            passwordHash,
            plan: 'premium',
            currency: 'INR',
            timezone: 'Asia/Kolkata'
          });
          await Subscription.create({
            userId: testUser._id,
            planId: 'premium_monthly',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false
          });
          console.log(`🔑 [Dev Boot] Auto-seeded demo account: ${testEmail} / FinPilot2026!`);
        }
      } catch (seedErr) {
        console.warn('[Dev Boot] Auto-seed note:', seedErr.message);
      }
    }

    // Run initial recurring transactions check on boot
    try {
      const initResult = await processDueRecurringTransactions();
      if (initResult.processedCount > 0) {
        console.log(`[RecurringEngine] Processed ${initResult.processedCount} due recurring transaction(s) on startup.`);
      }
    } catch (err) {
      console.error('[RecurringEngine] Startup run error:', err.message);
    }

    // Schedule background evaluation every hour
    recurringJobInterval = setInterval(async () => {
      try {
        const res = await processDueRecurringTransactions();
        if (res.processedCount > 0) {
          console.log(`[RecurringEngine] Background job recorded ${res.processedCount} due recurring transaction(s).`);
        }
      } catch (err) {
        console.error('[RecurringEngine] Periodic execution error:', err.message);
      }
    }, 60 * 60 * 1000);

    const app = createApp();

    const server = app.listen(config.PORT, '0.0.0.0', () => {
      console.log(`🚀 FinPilot Backend Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`📡 API Base: http://localhost:${config.PORT}/api/v1`);
    });

    const shutdown = async () => {
      console.log('Gracefully shutting down FinPilot server...');
      if (recurringJobInterval) {
        clearInterval(recurringJobInterval);
      }
      server.close(async () => {
        await mongoose.connection.close();
        if (mongoMemoryServerInstance) {
          await mongoMemoryServerInstance.stop();
        }
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start when run directly (not when imported in tests)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
