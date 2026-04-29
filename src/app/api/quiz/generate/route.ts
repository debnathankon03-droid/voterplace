import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, buildQuizSystemPrompt } from '@/lib/gemini';
import { getRelevantChunks, getAllTopics } from '@/lib/knowledgeBase';

// ── Simple in-memory rate limiter ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Fallback question if Gemini fails
const FALLBACK_QUESTION = {
  question: "What is the minimum age to register as a voter in India?",
  options: ["16 years", "18 years", "21 years", "25 years"],
  correctIndex: 1,
  explanation: "The voting age in India is 18 years, reduced from 21 by the 61st Constitutional Amendment in 1988.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty = 'beginner', voterStatus = 'unknown', topicHint, questionIndex = 0 } = body;

    // Use questionIndex for deterministic fallback (guarantees unique questions)
    const getFallbackForIndex = (idx: number) => FALLBACK_QUESTIONS[idx % FALLBACK_QUESTIONS.length];

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json(getFallbackForIndex(questionIndex));
    }

    // Pick a random topic or use the hint
    const topics = getAllTopics();
    const topic = topicHint || topics[Math.floor(Math.random() * topics.length)];

    // Get KB context for the topic
    const chunks = getRelevantChunks(topic, topic, 2);
    if (chunks.length === 0) {
      return NextResponse.json(getFallbackForIndex(questionIndex));
    }

    const kbContext = chunks.map(c => c.content).join('\n\n');

    // Build prompt and call Gemini
    const systemPrompt = buildQuizSystemPrompt(difficulty, voterStatus, kbContext);
    const model = getGeminiModel();

    let parsedQuestion;

    // Try twice
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        // Extract JSON from response (handle markdown code fences)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        parsedQuestion = JSON.parse(jsonMatch[0]);

        // Validate shape
        if (
          typeof parsedQuestion.question === 'string' &&
          Array.isArray(parsedQuestion.options) &&
          parsedQuestion.options.length === 4 &&
          typeof parsedQuestion.correctIndex === 'number' &&
          parsedQuestion.correctIndex >= 0 &&
          parsedQuestion.correctIndex <= 3 &&
          typeof parsedQuestion.explanation === 'string'
        ) {
          break; // Valid question
        }

        parsedQuestion = null;
      } catch {
        parsedQuestion = null;
      }
    }

    return NextResponse.json(parsedQuestion || getFallbackForIndex(questionIndex));
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]);
  }
}
