const request = require('supertest');

process.env.NODE_ENV = 'test';

const { app } = require('../index');

describe('Analytics API', () => {
  const testWallet = 'GBANALYTICSTEST1234567890ABCDEF1234567890ABCDEF1234567890';

  test('GET /api/analytics - requires wallet param', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/analytics - returns analytics for wallet', async () => {
    const res = await request(app).get(`/api/analytics?wallet=${testWallet}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('revenue');
    expect(res.body.data).toHaveProperty('subscribers');
    expect(res.body.data).toHaveProperty('plans');
  });

  test('GET /api/analytics - revenue contains monthly data array', async () => {
    const res = await request(app).get(`/api/analytics?wallet=${testWallet}`);
    expect(Array.isArray(res.body.data.revenue.monthly)).toBe(true);
  });

  test('GET /api/analytics - subscribers object has correct shape', async () => {
    const res = await request(app).get(`/api/analytics?wallet=${testWallet}`);
    const { subscribers } = res.body.data;
    expect(subscribers).toHaveProperty('active');
    expect(subscribers).toHaveProperty('cancelled');
    expect(subscribers).toHaveProperty('total');
    expect(subscribers).toHaveProperty('growthRate');
  });
});

describe('Coupons API', () => {
  test('GET /api/coupons/validate/WELCOME20 - validates real coupon', async () => {
    const res = await request(app).get('/api/coupons/validate/WELCOME20');
    expect(res.status).toBe(200);
    expect(res.body.data.discount_percent).toBe(20);
  });

  test('GET /api/coupons/validate/INVALID - rejects fake coupon', async () => {
    const res = await request(app).get('/api/coupons/validate/INVALIDCODE999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Health Check', () => {
  test('GET /health - returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('SubStellar API');
  });
});

afterAll(async () => {
  const { server } = require('../index');
  await new Promise(resolve => server.close(resolve));
});
