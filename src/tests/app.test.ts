// ============================================
// 🧪 TESTS — This is what CI runs automatically!
// ============================================
// Every time you push code, the CI pipeline runs these tests.
// If ANY test fails, the pipeline stops and blocks the merge.
// This prevents broken code from reaching production.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import http from 'http';

let server: http.Server;

beforeAll(() => {
  server = app.listen(0); // Port 0 = random available port
});

afterAll(() => {
  server.close();
});

// ─── Health Check Tests ──────────────────────────────
// The /health endpoint is critical for CI/CD:
// - CI uses it to verify the app starts correctly
// - Kubernetes uses it for liveness/readiness probes
// - Monitoring tools poll it to detect outages
describe('GET /health', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('environment');
  });
});

// ─── Greet API Tests ─────────────────────────────────
describe('GET /api/greet', () => {
  it('should greet with default name', async () => {
    const response = await request(app).get('/api/greet');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Hello, World!');
  });

  it('should greet with custom name', async () => {
    const response = await request(app).get('/api/greet?name=Nisan');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Hello, Nisan!');
  });
});

// ─── Calculator Tests ────────────────────────────────
// These tests cover happy paths AND error cases.
// Good CI/CD practice: test edge cases too!
describe('POST /api/calculate', () => {
  it('should add two numbers', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 10, b: 5, operation: 'add' });

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(15);
  });

  it('should subtract two numbers', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 10, b: 3, operation: 'subtract' });

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(7);
  });

  it('should multiply two numbers', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 4, b: 5, operation: 'multiply' });

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(20);
  });

  it('should divide two numbers', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 20, b: 4, operation: 'divide' });

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(5);
  });

  // ─── Error Cases (Edge Cases) ──────────────────────
  it('should reject division by zero', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 10, b: 0, operation: 'divide' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Cannot divide by zero');
  });

  it('should reject invalid operation', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 10, b: 5, operation: 'power' });

    expect(response.status).toBe(400);
  });

  it('should reject non-numeric inputs', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 'hello', b: 5, operation: 'add' });

    expect(response.status).toBe(400);
  });
});
