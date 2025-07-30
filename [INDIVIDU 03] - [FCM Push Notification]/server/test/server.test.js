const request = require('supertest');
const app = require('../app');
describe('FCM Push Notification Server', () => {
  it('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET / should return server info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('FCM Push Notification Server');
  });

  it('POST /send-notification without token should return 400', async () => {
    const res = await request(app).post('/send-notification').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('FCM registration token is required');
  });

  it('POST /send-multicast without tokens should return 400', async () => {
    const res = await request(app).post('/send-multicast').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Array of FCM registration tokens is required');
  });

  it('POST /validate-token without token should return 400', async () => {
    const res = await request(app).post('/validate-token').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('FCM registration token is required');
  });

  it('GET /unknown should return 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Endpoint not found');
  });
});
