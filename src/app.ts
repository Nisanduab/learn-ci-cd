import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// 🏠 Routes — Simple API for CI/CD learning
// ============================================

// Health check endpoint — crucial for CI/CD!
// This is what monitoring tools hit to verify your app is alive
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Simple API endpoint
app.get('/api/greet', (req: Request, res: Response) => {
  const name = req.query.name as string || 'World';
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

// Calculator endpoint — something we can write tests for!
app.post('/api/calculate', (req: Request, res: Response) => {
  const { a, b, operation } = req.body;

  if (typeof a !== 'number' || typeof b !== 'number') {
    res.status(400).json({ error: 'Both "a" and "b" must be numbers' });
    return;
  }

  let result: number;

  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      if (b === 0) {
        res.status(400).json({ error: 'Cannot divide by zero' });
        return;
      }
      result = a / b;
      break;
    default:
      res.status(400).json({
        error: 'Invalid operation. Use: add, subtract, multiply, divide',
      });
      return;
  }

  res.json({ a, b, operation, result });
});

// Export app for testing (important for CI/CD!)
// We separate the app from the server so tests can import the app
// without starting the server
export { app };
