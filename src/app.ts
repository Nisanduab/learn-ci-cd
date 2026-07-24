import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();

// Track server start time for uptime calculation
const startTime = Date.now();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// 📊 MODULE 6: Request Logging Middleware
// ============================================
// Logs every request with timing info.
// In production, these logs feed into monitoring tools
// (Datadog, Grafana, ELK Stack) for dashboards & alerts.
if (config.enableRequestLogging) {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    _res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = {
        method: req.method,
        path: req.path,
        status: _res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };
      // In production, this would go to a logging service
      // like Winston → CloudWatch, or Pino → Datadog
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    });
    next();
  });
}

// ============================================
// 🏠 Routes — Simple API for CI/CD learning
// ============================================

// ─── BASIC HEALTH CHECK ─────────────────────
// Used by: load balancers, uptime monitors
// Quick check: "is the app responding?"
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.appVersion,
    environment: config.nodeEnv,
  });
});

// ─── DEEP HEALTH CHECK (MODULE 6) ───────────
// Used by: Kubernetes readiness probes, deployment verification
// Checks: app + dependencies (DB, cache, external APIs)
// This is what post-deployment smoke tests hit.
app.get('/health/deep', (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  // In production, you'd also check:
  //   - Database connectivity
  //   - Redis/cache connectivity
  //   - External API availability
  //   - Disk space
  //   - Queue depth
  const checks = {
    app: { status: 'healthy' },
    memory: {
      status: memoryUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'degraded',
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
    // database: { status: 'healthy', latencyMs: 5 },  // Real DB check
    // redis: { status: 'healthy', latencyMs: 1 },      // Real cache check
  };

  const overallStatus = Object.values(checks).every(
    c => c.status === 'healthy'
  ) ? 'healthy' : 'degraded';

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    version: config.appVersion,
    environment: config.nodeEnv,
    uptime: `${uptime}s`,
    checks,
    timestamp: new Date().toISOString(),
  });
});

// ─── READINESS CHECK (MODULE 6) ─────────────
// Used by: Kubernetes readiness probes
// "Is this instance ready to receive traffic?"
// Separate from health — app can be alive but not ready
// (e.g., still warming up caches, loading config)
app.get('/ready', (_req: Request, res: Response) => {
  // In a real app, you'd check if:
  //   - Database connection pool is initialized
  //   - Cache is warmed up
  //   - Config is loaded
  const isReady = true;

  if (isReady) {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'not_ready', timestamp: new Date().toISOString() });
  }
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

