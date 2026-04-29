"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  RotateCcw,
  Loader2,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import type { QuizQuestion } from "@/types";

type Difficulty = "beginner" | "intermediate" | "advanced";

const TOTAL_QUESTIONS = 5;

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; icon: React.ElementType }> = {
  beginner: { label: "Beginner", color: "text-green-400", icon: Star },
  intermediate: { label: "Intermediate", color: "text-yellow-400", icon: Zap },
  advanced: { label: "Advanced", color: "text-red-400", icon: Brain },
};

export default function QuizPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; question: string }[]>([]);

  const fetchQuestion = async (diff: Difficulty, questionIndex?: number) => {
    setLoading(true);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuestion(null);

    try {
      const profile = JSON.parse(localStorage.getItem("matdaan-profile") || "{}");
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: diff,
          voterStatus: profile.voterStatus || "unknown",
          questionIndex: questionIndex ?? currentQ,
        }),
      });
      const data = await res.json();
      setQuestion(data);
    } catch {
      // Client-side fallback pool
      const fallbacks = [
        { question: "What does EVM stand for?", options: ["Electronic Voting Machine", "Electoral Verification Method", "Electronic Vote Monitor", "Election Validation Mechanism"], correctIndex: 0, explanation: "EVM stands for Electronic Voting Machine, used in Indian elections since 2004." },
        { question: "What is NOTA in Indian elections?", options: ["A political party", "None Of The Above option", "A type of ballot paper", "A voter registration form"], correctIndex: 1, explanation: "NOTA allows voters to reject all candidates. Introduced by the Supreme Court in 2013." },
        { question: "How many Lok Sabha constituencies are there?", options: ["435", "500", "543", "600"], correctIndex: 2, explanation: "India has 543 Lok Sabha constituencies, each electing one MP." },
        { question: "What is the minimum voting age in India?", options: ["16 years", "18 years", "21 years", "25 years"], correctIndex: 1, explanation: "The voting age is 18, reduced from 21 by the 61st Amendment in 1988." },
        { question: "What is VVPAT?", options: ["Voter Verified Paper Audit Trail", "Valid Vote Paper Authentication", "Voluntary Voting Protocol", "Verified Vote Processing"], correctIndex: 0, explanation: "VVPAT prints a paper slip showing which candidate the voter selected." },
      ];
      setQuestion(fallbacks[(questionIndex ?? currentQ) % fallbacks.length]);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (diff: Difficulty) => {
    setDifficulty(diff);
    setCurrentQ(0);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
    fetchQuestion(diff, 0);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || !question) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    const isCorrect = index === question.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((a) => [...a, { correct: isCorrect, question: question.question }]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= TOTAL_QUESTIONS) {
      setQuizComplete(true);

      // Persist quiz result to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("matdaan-quiz-results") || "[]");
        existing.push({
          id: `quiz-${Date.now()}`,
          difficulty,
          score: score + (selectedAnswer === question?.correctIndex ? 0 : 0), // score already updated
          total: TOTAL_QUESTIONS,
          takenAt: Date.now(),
        });
        // Keep last 20 results
        if (existing.length > 20) existing.splice(0, existing.length - 20);
        localStorage.setItem("matdaan-quiz-results", JSON.stringify(existing));
      } catch {
        // silently fail
      }
    } else {
      setCurrentQ((q) => q + 1);
      fetchQuestion(difficulty!, currentQ + 1);
    }
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Brain style={{ width: 20, height: 20, color: "#22d3ee" }} />
            <span style={{ fontWeight: 600 }}>Election Quiz</span>
          </div>
        </header>

        <main id="main-content" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #22d3ee, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Brain style={{ width: 32, height: 32, color: "white" }} />
            </div>
            <h1 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Test Your Knowledge</h1>
            <p style={{ color: "var(--muted-fg)", marginBottom: 32, fontSize: 15 }}>
              {TOTAL_QUESTIONS} questions powered by AI. Choose your difficulty level.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => startQuiz(key)}
                    className="glass glass-hover"
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", color: "inherit", background: "transparent" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                      <span style={{ fontWeight: 500 }}>{config.label}</span>
                    </div>
                    <ArrowRight style={{ width: 16, height: 16, color: "var(--muted-fg)" }} />
                  </button>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz complete screen
  if (quizComplete) {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    const badge = percentage >= 80 ? "🏆 Election Expert" : percentage >= 50 ? "⭐ Informed Citizen" : "📚 Keep Learning";

    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 600 }}>Quiz Results</span>
        </header>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Trophy style={{ width: 40, height: 40, color: "#0b0f1a" }} />
            </div>

            <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quiz Complete!</h2>
            <p className="gradient-text" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
              {score}/{TOTAL_QUESTIONS}
            </p>
            <p style={{ color: "var(--muted-fg)", marginBottom: 8 }}>{percentage}% correct</p>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 32 }}>{badge}</div>

            {/* Review answers */}
            <div className="glass" style={{ padding: 20, marginBottom: 24, textAlign: "left" }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Review</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {answers.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14 }}>
                    {a.correct ? (
                      <CheckCircle style={{ width: 16, height: 16, color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                    )}
                    <span style={{ color: "var(--muted-fg)" }}>{a.question}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setDifficulty(null)} className="btn-secondary" style={{ flex: 1, padding: "12px 24px" }}>
                <RotateCcw style={{ width: 16, height: 16 }} />
                Try Again
              </button>
              <Link href="/dashboard" className="btn-primary" style={{ flex: 1, padding: "12px 24px" }}>
                Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active quiz question
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Question {currentQ + 1}/{TOTAL_QUESTIONS}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <Sparkles style={{ width: 16, height: 16, color: "#f97316" }} />
          <span>Score: {score}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
          style={{ width: `${((currentQ + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Generating question...</p>
            </div>
          ) : question ? (
            <>
              <h2 className="font-display text-xl font-bold mb-6 leading-relaxed">
                {question.question}
              </h2>

              <div className="space-y-3 mb-6">
                {question.options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === question.correctIndex;
                  const showResult = selectedAnswer !== null;

                  let borderClass = "border-border hover:border-orange-500/30";
                  if (showResult && isCorrect) borderClass = "border-green-500 bg-green-500/10";
                  else if (showResult && isSelected && !isCorrect) borderClass = "border-red-500 bg-red-500/10";

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${borderClass} ${
                        !showResult ? "bg-surface" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          showResult && isCorrect
                            ? "bg-green-500 text-white"
                            : showResult && isSelected
                            ? "bg-red-500 text-white"
                            : "bg-surface-hover"
                        }`}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : showResult && isSelected ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="glass p-4 mb-6 slide-in-up">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold text-sm">Explanation</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}

              {selectedAnswer !== null && (
                <button onClick={nextQuestion} className="btn-primary w-full justify-center">
                  {currentQ + 1 >= TOTAL_QUESTIONS ? "View Results" : "Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
