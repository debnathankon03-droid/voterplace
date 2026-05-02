// ============================================================
// Gemini AI Integration — Server-side only
// ============================================================

/**
 * Gemini AI Integration Module
 * Wraps the Google Generative AI SDK, configuring models for structured
 * responses (like JSON for quizzes) and streaming responses (for chat).
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get the Gemini Flash model for chat and quiz generation.
 * Uses Gemini 2.0 Flash for speed and free-tier availability.
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });
}

/**
 * Build the system prompt for chat with user context and KB chunks.
 */
export function buildChatSystemPrompt(
  language: string,
  userContext: string,
  kbContext: string
): string {
  return `You are Matdaan Mitra, a friendly, neutral assistant that helps Indian citizens understand the election process. Rules:
- Use ONLY information from the CONTEXT below.
- If the answer is not in CONTEXT, say so and point to eci.gov.in.
- Never recommend candidates or parties. Stay strictly non-partisan.
- Match the user's preferred language: ${language}.
- Keep answers under 120 words unless asked for detail.
- Tailor advice to the user profile.
- Be warm, encouraging, and supportive — especially for first-time voters.
- Use simple, clear language.

USER PROFILE: ${userContext}
CONTEXT: ${kbContext}`;
}

/**
 * Build the system prompt for quiz generation.
 */
export function buildQuizSystemPrompt(
  difficulty: string,
  voterStatus: string,
  kbContext: string
): string {
  return `Generate ONE multiple-choice question about Indian elections from the CONTEXT only.
Difficulty: ${difficulty}
User voter status: ${voterStatus}
Return STRICT JSON only, no markdown, no code fences:
{ "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..." }
The correctIndex must be 0-3 matching the correct option.
CONTEXT: ${kbContext}`;
}
