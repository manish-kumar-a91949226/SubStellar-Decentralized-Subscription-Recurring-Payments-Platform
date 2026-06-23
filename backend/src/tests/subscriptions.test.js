const request = require('supertest');

process.env.NODE_ENV = 'test';

const { app } = require('../index');

describe('Subscriptions API', () => {
  let testPlanId;
  let testSubId;
  const testWallet = 'GBSUB1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12';

  beforeAll(async () => {
    // Create a plan to subscribe to
    const planRes = await request(app).post('/api/plans').send({
      creator_wallet: 'GBCREATOR123456789ABCDEF123456789ABCDEF123456789ABCDEF1',
      name: 'Sub Test Plan',
      price: 5,
      interval: 'monthly',
      trial_days: 0,
      tier: 'starter',
      benefits: ['Access'],
      is_public: true,
    });
    testPlanId = planRes.body.data.id;
  });

  test('POST /api/subscriptions - creates a subscription', async () => {
    const res = await request(app).post('/api/subscriptions').send({
      user_wallet: testWallet,
      plan_id: testPlanId,
      stellar_hash: 'abc123testhash456def',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('active');
    testSubId = res.body.data.id;
  });

  test('GET /api/subscriptions - returns user subscriptions', async () => {
    const res = await request(app).get(`/api/subscriptions?wallet=${testWallet}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('POST /api/subscriptions - prevents duplicate subscription', async () => {
    const res = await request(app).post('/api/subscriptions').send({
      user_wallet: testWallet,
      plan_id: testPlanId,
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('PATCH /api/subscriptions/:id/pause - pauses a subscription', async () => {
    const res = await request(app).patch(`/api/subscriptions/${testSubId}/pause`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paused');
  });

  test('PATCH /api/subscriptions/:id/resume - resumes a subscription', async () => {
    const res = await request(app).patch(`/api/subscriptions/${testSubId}/resume`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
  });

  test('PATCH /api/subscriptions/:id/cancel - cancels a subscription', async () => {
    const res = await request(app).patch(`/api/subscriptions/${testSubId}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });
});

afterAll(async () => {
  const { server } = require('../index');
  await new Promise(resolve => server.close(resolve));
});
