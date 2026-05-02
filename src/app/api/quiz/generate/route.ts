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

// Fallback questions pool if Gemini fails
const FALLBACK_QUESTIONS = [
  {
    question: "What is the minimum age to register as a voter in India?",
    options: ["16 years", "18 years", "21 years", "25 years"],
    correctIndex: 1,
    explanation: "The voting age in India is 18 years, reduced from 21 by the 61st Constitutional Amendment in 1988.",
  },
  {
    question: "What does EVM stand for?",
    options: ["Electronic Voting Machine", "Electoral Verification Method", "Electronic Vote Monitor", "Election Validation Mechanism"],
    correctIndex: 0,
    explanation: "EVM stands for Electronic Voting Machine, used in Indian elections since 2004 for all general and state elections.",
  },
  {
    question: "What is NOTA in Indian elections?",
    options: ["A political party", "None Of The Above option", "A type of ballot paper", "A voter registration form"],
    correctIndex: 1,
    explanation: "NOTA (None Of The Above) allows voters to reject all candidates. It was introduced by the Supreme Court in 2013.",
  },
  {
    question: "How many Lok Sabha constituencies are there in India?",
    options: ["435", "500", "543", "600"],
    correctIndex: 2,
    explanation: "India has 543 Lok Sabha constituencies. Each constituency elects one Member of Parliament (MP).",
  },
  {
    question: "Which body conducts elections in India?",
    options: ["Supreme Court", "Election Commission of India", "Parliament", "President of India"],
    correctIndex: 1,
    explanation: "The Election Commission of India (ECI) is an autonomous constitutional body responsible for administering elections.",
  },
  {
    question: "What is VVPAT?",
    options: ["Voter Verified Paper Audit Trail", "Valid Vote Paper Authentication Tool", "Voluntary Voting Protocol And Tracking", "Verified Vote Processing And Tabulation"],
    correctIndex: 0,
    explanation: "VVPAT is a machine that prints a paper slip showing which candidate the voter selected, providing an audit trail for EVMs.",
  },
  {
    question: "What is the EPIC card?",
    options: ["Election Party Identification Card", "Electors Photo Identity Card", "Electronic Poll Information Certificate", "Election Process Initiation Card"],
    correctIndex: 1,
    explanation: "EPIC stands for Electors Photo Identity Card, commonly known as the Voter ID card, issued by the ECI.",
  },
  {
    question: "Which form is used for new voter registration in India?",
    options: ["Form 4", "Form 6", "Form 8", "Form 10"],
    correctIndex: 1,
    explanation: "Form 6 is used for new voter registration or for inclusion of name in the electoral roll.",
  },
  {
    question: "What is the 'Model Code of Conduct'?",
    options: ["A law passed by Parliament", "Guidelines for parties during elections", "The Constitution of India", "Rules for counting votes"],
    correctIndex: 1,
    explanation: "The Model Code of Conduct is a set of guidelines issued by the ECI for political parties and candidates during elections.",
  },
  {
    question: "What is the indelible ink used for in elections?",
    options: ["Signing ballot papers", "Marking voter's finger to prevent repeat voting", "Stamping the ballot box", "Printing voter slips"],
    correctIndex: 1,
    explanation: "Indelible ink is applied on the voter's left index finger to prevent them from voting more than once.",
  },
];

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
