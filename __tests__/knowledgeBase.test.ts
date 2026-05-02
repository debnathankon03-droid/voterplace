import { getRelevantChunks, getAllTopics } from '@/lib/knowledgeBase';

describe('knowledgeBase', () => {
  describe('getAllTopics', () => {
    it('returns an array of topics', () => {
      const topics = getAllTopics();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics).toContain('registration');
      expect(topics).toContain('polling-process');
    });
  });

  describe('getRelevantChunks', () => {
    it('returns relevant chunks for a known topic', () => {
      const chunks = getRelevantChunks('registration', 'how to register');
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].topic).toBe('registration');
      expect(typeof chunks[0].content).toBe('string');
    });

    it('returns cross-topic chunks for generic queries', () => {
      const chunks = getRelevantChunks('EVM');
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      // EVM is typically mentioned in polling-process or glossary
      expect(chunks.some(c => c.topic === 'polling-process' || c.topic === 'glossary')).toBe(true);
    });

    it('returns empty array if nothing found', () => {
      const chunks = getRelevantChunks('unknown_topic', 'xyz123abc456');
      expect(chunks).toEqual([]);
    });
  });
});
