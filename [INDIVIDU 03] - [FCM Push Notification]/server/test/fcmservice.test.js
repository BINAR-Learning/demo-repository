// Mock Firebase Admin SDK before importing FCMService
jest.mock('firebase-admin', () => ({
  messaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue('mockMessageId'),
    sendMulticast: jest.fn().mockResolvedValue({
      successCount: 1,
      failureCount: 0,
      responses: [{ success: true }]
    })
  }))
}));

const FCMService = require('../fcmservice');

describe('FCMService', () => {
  let fcmService;

  beforeEach(() => {
    fcmService = new FCMService();
  });

  it('should send a notification', async () => {
    const result = await fcmService.sendNotification('token', 'title', 'body', 'url');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('mockMessageId');
  });

  it('should send a multicast notification', async () => {
    const result = await fcmService.sendMulticastNotification(['token1'], 'title', 'body', 'url');
    expect(result.success).toBe(true);
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(0);
  });

  it('should validate a token (valid)', async () => {
    fcmService.messaging.send = jest.fn().mockResolvedValue(true);
    const result = await fcmService.validateToken('token');
    expect(result.valid).toBe(true);
  });

  it('should validate a token (invalid)', async () => {
    fcmService.messaging.send = jest.fn().mockRejectedValue(new Error('Invalid token'));
    const result = await fcmService.validateToken('token');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid token');
  });
});
