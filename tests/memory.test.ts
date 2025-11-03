import { MemoryStore } from '../src/utils/memory';
import fs from 'fs/promises';
import path from 'path';

const TEST_STORAGE_PATH = './test-memory-data';

describe('Memory Store', () => {
  let memoryStore: MemoryStore;

  beforeAll(async () => {
    memoryStore = new MemoryStore(TEST_STORAGE_PATH);
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await fs.rm(TEST_STORAGE_PATH, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('User Memory Management', () => {
    it('should create new user memory if none exists', async () => {
      const userId = 'test-user-1';
      const memory = await memoryStore.loadUserMemory(userId);

      expect(memory.userId).toBe(userId);
      expect(memory.conversations).toEqual([]);
      expect(memory.summaries).toEqual([]);
    });

    it('should add messages to conversation history', async () => {
      const userId = 'test-user-2';
      
      await memoryStore.addMessage(userId, 'user', 'Hello bot!');
      await memoryStore.addMessage(userId, 'assistant', 'Hi there!');

      const memory = await memoryStore.loadUserMemory(userId);
      expect(memory.conversations.length).toBe(2);
      expect(memory.conversations[0].role).toBe('user');
      expect(memory.conversations[0].content).toBe('Hello bot!');
      expect(memory.conversations[1].role).toBe('assistant');
    });

    it('should add summaries to user history', async () => {
      const userId = 'test-user-3';
      
      const summaryId = await memoryStore.addSummary(
        userId,
        'text',
        'This is a test summary',
        { source: 'test' }
      );

      expect(summaryId).toContain('sum_');

      const memory = await memoryStore.loadUserMemory(userId);
      expect(memory.summaries.length).toBe(1);
      expect(memory.summaries[0].type).toBe('text');
      expect(memory.summaries[0].summary).toBe('This is a test summary');
    });

    it('should get recent conversations', async () => {
      const userId = 'test-user-4';
      
      // Add multiple messages
      for (let i = 0; i < 15; i++) {
        await memoryStore.addMessage(userId, 'user', `Message ${i}`);
      }

      const recent = await memoryStore.getRecentConversation(userId, 10);
      expect(recent.length).toBe(10);
      expect(recent[recent.length - 1].content).toBe('Message 14');
    });

    it('should limit conversation history to 50 messages', async () => {
      const userId = 'test-user-5';
      
      // Add 60 messages
      for (let i = 0; i < 60; i++) {
        await memoryStore.addMessage(userId, 'user', `Message ${i}`);
      }

      const memory = await memoryStore.loadUserMemory(userId);
      expect(memory.conversations.length).toBe(50);
    });

    it('should persist memory across loads', async () => {
      const userId = 'test-user-6';
      
      await memoryStore.addMessage(userId, 'user', 'Persistent message');
      await memoryStore.addSummary(userId, 'url', 'Persistent summary');

      // Create new instance to test persistence
      const newMemoryStore = new MemoryStore(TEST_STORAGE_PATH);
      const memory = await newMemoryStore.loadUserMemory(userId);

      expect(memory.conversations.length).toBeGreaterThan(0);
      expect(memory.summaries.length).toBeGreaterThan(0);
    });
  });
});
