// ============================================================
// ⚙️ CONFIGURATION MODULE — Environment-Aware Settings
// ============================================================
//
// MODULE 4: This is how real apps manage configuration.
//
// Similar to NestJS ConfigModule or Spring Boot's
// application.properties / application-{profile}.yml
//
// The key principle: NEVER hardcode environment-specific values.
// Everything comes from environment variables.
//
// In CI/CD:
//   - Development: values from .env file (local only)
//   - Staging: values from GitHub Environment "staging"
//   - Production: values from GitHub Environment "production"
//
// ============================================================

import dotenv from 'dotenv';

// Load .env file (only works locally, not in CI/CD)
dotenv.config();

interface AppConfig {
  // App
  nodeEnv: string;
  port: number;
  appVersion: string;

  // Feature flags
  enableDetailedErrors: boolean;
  enableRequestLogging: boolean;

  // External services (would be real in production)
  apiKey: string | undefined;
  databaseUrl: string | undefined;
  deployUrl: string;
  logLevel: string;
}

// Build config from environment variables
const config: AppConfig = {
  // App settings
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appVersion: process.env.APP_VERSION || '1.0.0',

  // Feature flags — different per environment!
  // In dev/staging: show detailed errors for debugging
  // In production: hide errors (security risk to expose internals)
  enableDetailedErrors: process.env.NODE_ENV !== 'production',
  enableRequestLogging: process.env.NODE_ENV !== 'production',

  // External services
  apiKey: process.env.API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  deployUrl: process.env.DEPLOY_URL || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required config on startup
function validateConfig(): void {
  const errors: string[] = [];

  if (config.nodeEnv === 'production') {
    // In production, certain vars MUST be set
    if (!config.apiKey) errors.push('API_KEY is required in production');
    if (!config.databaseUrl) errors.push('DATABASE_URL is required in production');
  }

  if (errors.length > 0) {
    throw new Error(
      `❌ Configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

export { config, validateConfig };
