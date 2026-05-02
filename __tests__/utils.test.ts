import { sanitizeInput, generateId, truncate, formatDate } from '@/lib/utils';

describe('utils', () => {
  describe('sanitizeInput', () => {
    it('escapes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;hello');
    });

    it('caps at 2000 characters', () => {
      const longStr = 'a'.repeat(3000);
      expect(sanitizeInput(longStr).length).toBe(2000);
    });
  });

  describe('generateId', () => {
    it('generates a string containing timestamp and random part', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('generates unique strings', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('truncate', () => {
    it('does not truncate if under max length', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates and adds ellipsis if over max length', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });
  });

  describe('formatDate', () => {
    it('formats a timestamp into a readable string', () => {
      const timestamp = new Date('2024-04-15T12:00:00Z').getTime();
      const formatted = formatDate(timestamp);
      // Depending on environment timezone, it could be 15 Apr or 15 Apr 2024 etc.
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/Apr/);
      expect(formatted).toMatch(/2024/);
    });
  });
});
