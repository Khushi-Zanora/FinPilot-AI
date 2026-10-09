import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import insuranceRoutes from './routes/insuranceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: [config.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    })
  );

  // Cookie parsing
  app.use(cookieParser());

  // JSON Body parsing with raw body capture for webhook signature verification
  app.use(
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      }
    })
  );

  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'FinPilot API', timestamp: new Date().toISOString() });
  });
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
  });

  // API v1 Routing
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/accounts', accountRoutes);
  apiRouter.use('/transactions', transactionRoutes);
  apiRouter.use('/budgets', budgetRoutes);
  apiRouter.use('/goals', goalRoutes);
  apiRouter.use('/loans', loanRoutes);
  apiRouter.use('/investments', investmentRoutes);
  apiRouter.use('/insurance', insuranceRoutes);
  apiRouter.use('/dashboard', dashboardRoutes);
  apiRouter.use('/reports', reportRoutes);
  apiRouter.use('/billing', billingRoutes);
  apiRouter.use('/ai', aiRoutes);
  apiRouter.use('/public', publicRoutes);

  app.use('/api/v1', apiRouter);

  // 404 handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.originalUrl} not found`
      }
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
