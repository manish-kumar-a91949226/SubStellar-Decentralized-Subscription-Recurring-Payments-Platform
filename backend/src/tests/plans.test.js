const request = require('supertest');

// Use a separate test db
process.env.NODE_ENV = 'test';

const { app } = require('../index');

describe('Plans API', () => {
  let createdPlanId;

  test('GET /api/plans - returns list of plans', async () => {
    const res = await request(app).get('/api/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/plans - creates a new plan', async () => {
    const res = await request(app).post('/api/plans').send({
      creator_wallet: 'GBTEST1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12',
      name: 'Test Plan',
      description: 'A test subscription plan',
      price: 10,
      interval: 'monthly',
      trial_days: 7,
      tier: 'starter',
      benefits: ['Feature A', 'Feature B'],
      is_public: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Plan');
    expect(res.body.data.price).toBe(10);
    createdPlanId = res.body.data.id;
  });

  test('GET /api/plans/:id - returns single plan', async () => {
    const res = await request(app).get(`/api/plans/${createdPlanId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdPlanId);
  });

  test('PUT /api/plans/:id - updates a plan', async () => {
    const res = await request(app).put(`/api/plans/${createdPlanId}`).send({
      name: 'Updated Test Plan',
      price: 15,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Test Plan');
  });

  test('POST /api/plans - fails without required fields', async () => {
    const res = await request(app).post('/api/plans').send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/plans/:id - returns 404 for unknown plan', async () => {
    const res = await request(app).get('/api/plans/nonexistent-id-xyz');
    expect(res.status).toBe(404);
  });
});

afterAll(async () => {
  const { server } = require('../index');
  await new Promise(resolve => server.close(resolve));
});
