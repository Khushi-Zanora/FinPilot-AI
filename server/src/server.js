import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/index.js';

async function startServer() {
  let mongoMemoryServerInstance = null;

  try {
    let mongoUri = config.MONGODB_URI;

    try {
      console.log(`Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      console.log('✅ Connected to MongoDB successfully.');
    } catch (dbErr) {
      if (config.NODE_ENV !== 'production') {
        console.warn('⚠️ Local MongoDB not detected. Initializing in-memory MongoDB server for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        mongoUri = mongoMemoryServerInstance.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ In-memory MongoDB connected successfully at:', mongoUri);
      } else {
        throw dbErr;
      }
    }

    const app = createApp();

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 FinPilot Backend Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`📡 API Base: http://localhost:${config.PORT}/api/v1`);
    });

    const shutdown = async () => {
      console.log('Gracefully shutting down FinPilot server...');
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
