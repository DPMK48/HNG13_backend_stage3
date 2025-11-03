import { scrapeWebpage, extractTxtText, prepareTextForSummary } from '../src/tools/summarization';

describe('Summarization Tools', () => {
  describe('prepareTextForSummary', () => {
    it('should trim and return text within max length', () => {
      const text = '  This is a test text  ';
      const result = prepareTextForSummary(text);
      expect(result).toBe('This is a test text');
    });

    it('should truncate text that exceeds max length', () => {
      const longText = 'a'.repeat(20000);
      const result = prepareTextForSummary(longText, 15000);
      expect(result.length).toBeLessThanOrEqual(15003); // 15000 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should throw error for empty text', () => {
      expect(() => prepareTextForSummary('')).toThrow('No content found to summarize');
    });
  });

  describe('extractTxtText', () => {
    it('should extract text from buffer', () => {
      const buffer = Buffer.from('Hello, World!');
      const result = extractTxtText(buffer);
      expect(result).toBe('Hello, World!');
    });

    it('should handle UTF-8 encoded text', () => {
      const text = 'Hello 👋 World 🌍';
      const buffer = Buffer.from(text, 'utf-8');
      const result = extractTxtText(buffer);
      expect(result).toBe(text);
    });
  });

  describe('scrapeWebpage', () => {
    it('should throw error for invalid URL', async () => {
      await expect(scrapeWebpage('not-a-url')).rejects.toThrow();
    });

    it('should throw error for non-existent domain', async () => {
      await expect(scrapeWebpage('https://this-domain-does-not-exist-12345.com')).rejects.toThrow();
    }, 15000);
  });
});
