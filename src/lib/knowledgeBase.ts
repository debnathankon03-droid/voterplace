// ============================================================
// Knowledge Base — Loader, Chunker, and Retrieval
// ============================================================

/**
 * Knowledge Base Module
 * Simulates a vector database or retrieval system for RAG (Retrieval-Augmented Generation).
 * Stores raw textual data about election processes and facts.
 */
import { KBChunk } from '@/types';

// Import KB files as raw strings at build time
import registrationMd from '@/data/kb/registration.md';
import pollingMd from '@/data/kb/polling-process.md';
import phasesMd from '@/data/kb/election-phases.md';
import rightsMd from '@/data/kb/rights-and-grievance.md';
import glossaryMd from '@/data/kb/glossary.md';

/** All KB source files */
const KB_SOURCES: { content: string; fallbackTopic: string }[] = [
  { content: registrationMd, fallbackTopic: 'registration' },
  { content: pollingMd, fallbackTopic: 'polling-process' },
  { content: phasesMd, fallbackTopic: 'election-phases' },
  { content: rightsMd, fallbackTopic: 'rights-and-grievance' },
  { content: glossaryMd, fallbackTopic: 'glossary' },
];

/**
 * Parse frontmatter from a markdown string.
 */
function parseFrontmatter(md: string): { meta: Record<string, string | string[]>; body: string } {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { meta: {}, body: md };

  const meta: Record<string, string | string[]> = {};
  for (const line of fmMatch[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    // Parse YAML arrays like [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      meta[key] = value.slice(1, -1).split(',').map(s => s.trim());
    } else {
      meta[key] = value;
    }
  }
  return { meta, body: fmMatch[2] };
}

/**
 * Chunk a markdown document by headings (## level).
 * Each chunk contains the heading and its content.
 */
function chunkByHeading(body: string, topic: string, tags: string[], source?: string): KBChunk[] {
  const chunks: KBChunk[] = [];
  const sections = body.split(/\n(?=## )/);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;

    const headingMatch = lines[0].match(/^##\s+(.+)/);
    const heading = headingMatch ? headingMatch[1] : topic;
    const content = lines.slice(headingMatch ? 1 : 0).join('\n').trim();

    if (content.length > 0) {
      chunks.push({ topic, heading, content, tags, source });
    }
  }

  // If no ## headings found, treat entire body as one chunk
  if (chunks.length === 0 && body.trim().length > 0) {
    chunks.push({ topic, heading: topic, content: body.trim(), tags, source });
  }

  return chunks;
}

/** Cached chunks — loaded once */
let _allChunks: KBChunk[] | null = null;

/**
 * Load all KB chunks. Uses memoization.
 */
export function loadAllChunks(): KBChunk[] {
  if (_allChunks) return _allChunks;

  _allChunks = [];
  for (const { content, fallbackTopic } of KB_SOURCES) {
    const { meta, body } = parseFrontmatter(content);
    const topic = (meta.topic as string) || fallbackTopic;
    const tags = (meta.tags as string[]) || [];
    const source = meta.source as string | undefined;
    _allChunks.push(...chunkByHeading(body, topic, tags, source));
  }
  return _allChunks;
}

/**
 * Simple keyword-based retrieval.
 * Scores each chunk by keyword overlap with the query.
 *
 * @param query     - User's question or search terms
 * @param topic     - Optional: filter to a specific topic first
 * @param maxChunks - Maximum number of chunks to return (default 3)
 */
export function getRelevantChunks(query: string, topic?: string, maxChunks = 3): KBChunk[] {
  let chunks = loadAllChunks();

  // Filter by topic if specified
  if (topic) {
    const topicChunks = chunks.filter(c => c.topic === topic);
    if (topicChunks.length > 0) chunks = topicChunks;
  }

  // Tokenize query
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2); // skip short words

  // Score each chunk
  const scored = chunks.map(chunk => {
    const text = `${chunk.heading} ${chunk.content} ${chunk.tags.join(' ')}`.toLowerCase();
    let score = 0;

    for (const token of queryTokens) {
      // Exact word match
      if (text.includes(token)) score += 1;
      // Tag match (higher weight)
      if (chunk.tags.some(tag => tag.includes(token))) score += 2;
      // Heading match (higher weight)
      if (chunk.heading.toLowerCase().includes(token)) score += 3;
    }

    return { chunk, score };
  });

  // Sort by score descending, take top N
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(s => s.chunk);
}

/**
 * Get all chunks for a specific topic.
 */
export function getChunksByTopic(topic: string): KBChunk[] {
  return loadAllChunks().filter(c => c.topic === topic);
}

/**
 * Get all unique topics.
 */
export function getAllTopics(): string[] {
  return [...new Set(loadAllChunks().map(c => c.topic))];
}
