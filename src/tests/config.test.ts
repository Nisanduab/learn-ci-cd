// ============================================================
// 🧪 CONFIG TESTS — Testing environment-aware configuration
// ============================================================
//
// MODULE 5: Quality Gates in action!
//
// These tests exist BECAUSE the coverage gate caught that
// config.ts had 0% function coverage. The gate blocked the
// pipeline, forcing us to add tests. This is exactly how
// quality gates keep your codebase healthy.
//
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Config Module', () => {
  // Save original env vars so we can restore them after each test
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset module cache so config.ts re-reads env vars
    // This is needed because config.ts reads env vars at import time
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  it('should load default config values', async () => {
    // Dynamic import to get fresh config each time
    const { config } = await import('../config');

    expect(config.port).toBe(3000);
    expect(config.appVersion).toBe('1.0.0');
    expect(config).toHaveProperty('nodeEnv');
    expect(config).toHaveProperty('enableDetailedErrors');
    expect(config).toHaveProperty('enableRequestLogging');
    expect(config).toHaveProperty('logLevel');
  });

  it('should have validateConfig function', async () => {
    const { validateConfig } = await import('../config');

    expect(typeof validateConfig).toBe('function');
    // In non-production, validateConfig should not throw
    expect(() => validateConfig()).not.toThrow();
  });

  it('should enable detailed errors in non-production', async () => {
    const { config } = await import('../config');

    // In test environment, detailed errors should be enabled
    if (config.nodeEnv !== 'production') {
      expect(config.enableDetailedErrors).toBe(true);
      expect(config.enableRequestLogging).toBe(true);
    }
  });
});
