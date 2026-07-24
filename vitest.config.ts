import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'src/server.ts'],
      // ════════════════════════════════════════════
      // MODULE 5: QUALITY GATES — Coverage Thresholds
      // ════════════════════════════════════════════
      // If coverage drops below these thresholds,
      // `npm run test:coverage` FAILS → CI blocks the merge!
      //
      // This prevents developers from merging code
      // without adequate test coverage.
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
