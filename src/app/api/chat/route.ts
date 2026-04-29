import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, buildChatSystemPrompt } from '@/lib/gemini';
import { getRelevantChunks } from '@/lib/knowledgeBase';
import { sanitizeInput } from '@/lib/utils';

// ── Simple in-memory rate limiter ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // requests per window

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

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, userContext, language = 'en', topic } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sanitized = sanitizeInput(message);
    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Retrieve relevant KB chunks
    const chunks = getRelevantChunks(sanitized, topic, 3);
    const kbContext = chunks.length > 0
      ? chunks.map(c => `[${c.topic} — ${c.heading}]\n${c.content}`).join('\n\n---\n\n')
      : 'No specific context found. Direct user to eci.gov.in for authoritative information.';

    const citations = chunks.map(c => c.source).filter(Boolean) as string[];

    // Build system prompt
    const systemPrompt = buildChatSystemPrompt(
      language,
      userContext || 'No profile provided',
      kbContext
    );

    // Call Gemini with streaming
    const model = getGeminiModel();
    const result = await model.generateContentStream([
      { text: systemPrompt },
      { text: sanitized },
    ]);

    // Stream the response using a ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Send each chunk as a Server-Sent Event
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
          }

          // Send citations at the end
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, citations: [...new Set(citations)] })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Stream interrupted. Please try again.' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
