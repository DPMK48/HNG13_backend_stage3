import { describe, it, expect } from '@jest/globals';

describe('Server Configuration', () => {
  it('should have required environment variables', () => {
    const requiredVars = ['OPENAI_API_KEY'];
    
    requiredVars.forEach((varName) => {
      expect(process.env[varName]).toBeDefined();
    });
  });

  it('should use correct port configuration', () => {
    const port = parseInt(process.env.PORT || '3000', 10);
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });
});
