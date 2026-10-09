import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/index.js';

async function startServer() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    const app = createApp();

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 FinPilot Backend Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`📡 API Base: http://localhost:${config.PORT}/api/v1`);
    });

    const shutdown = async () => {
      console.log('Gracefully shutting down FinPilot server...');
      server.close(async () => {
        await mongoose.connection.close();
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
