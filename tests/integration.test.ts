import request from 'supertest';
import app from '../src/integrations/telex';

describe('Telex Integration', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.agent).toBe('SummarizeBot');
    });
  });

  describe('A2A Endpoint', () => {
    it('should respond to triggered messages', async () => {
      const response = await request(app)
        .post('/a2a/agent/summarizeBot')
        .send({
          message: '@bot summarize',
          userId: 'test-user',
          channelId: 'test-channel',
        })
        .expect(200);

      expect(response.body.responded).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should not respond to non-triggered messages', async () => {
      const response = await request(app)
        .post('/a2a/agent/summarizeBot')
        .send({
          message: 'Hello there',
          userId: 'test-user',
          channelId: 'test-channel',
        })
        .expect(200);

      expect(response.body.responded).toBe(false);
    });

    it('should handle invalid message format', async () => {
      const response = await request(app)
        .post('/a2a/agent/summarizeBot')
        .send({
          userId: 'test-user',
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Webhook Endpoint', () => {
    it('should respond to webhook requests', async () => {
      const response = await request(app)
        .post('/webhook')
        .send({
          text: '@bot summarize this text',
          user_id: 'test-user',
          channel_id: 'test-channel',
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    it('should ignore non-triggered webhook messages', async () => {
      const response = await request(app)
        .post('/webhook')
        .send({
          text: 'Just a regular message',
          user_id: 'test-user',
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
    });
  });
});
