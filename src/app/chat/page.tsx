"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Vote,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";
import MessageBubble from "@/components/chat/MessageBubble";

/**
 * ChatPage provides an AI-powered conversational interface for voters.
 * It handles standard text chat as well as Speech-to-Text inputs.
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! 🙏 I'm Matdaan Mitra, your election guide. Ask me anything about voter registration, polling process, your rights, or election phases. I'm here to help!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user profile from localStorage
  const [profile, setProfile] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("matdaan-profile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (overrideMessage?: string) => {
    const msg = overrideMessage || input.trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: msg,
      timestamp: Date.now(),
    };

    const assistantMsgId = generateId();

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const userContext = profile
        ? `Age: ${profile.age}, State: ${profile.state}, Status: ${profile.voterStatus}`
        : "Unknown";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userContext,
          language: profile?.preferredLanguage || "en",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Request failed");
      }

      // Create a placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(false);

      // Read the SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.content) {
              // Append streaming text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            }

            if (data.done && data.citations) {
              // Attach citations at the end
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, citations: data.citations }
                    : m
                )
              );
            }

            if (data.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: data.error }
                    : m
                )
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        // If placeholder exists, update it; otherwise add new
        const hasPlaceholder = prev.some((m) => m.id === assistantMsgId);
        if (hasPlaceholder) {
          return prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    "Sorry, I'm having trouble connecting. Please make sure the Gemini API key is configured and try again.",
                }
              : m
          );
        }
        return [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant" as const,
            content:
              "Sorry, I'm having trouble connecting. Please make sure the Gemini API key is configured and try again.",
            timestamp: Date.now(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Check for topic query param (placed after handleSend definition)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    if (topic) {
      const topicQuestions: Record<string, string> = {
        "pre-registration": "How can I pre-register to vote if I'm under 18?",
        "registration-documents": "What documents do I need to register as a voter?",
        "voter-rights": "What are my rights as a voter in India?",
        "voting-process": "How does voting work with EVM and VVPAT?",
        "polling-checklist": "What should I bring on polling day?",
        "how-to-vote": "Walk me through the voting process step by step.",
        "polling-hours": "What are the polling hours and what if I'm late?",
        "counting-process": "How does vote counting work in India?",
      };
      const question = topicQuestions[topic];
      if (question) {
        setTimeout(() => handleSend(question), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice input
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionAPI() as any;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = profile?.preferredLanguage === "hi" ? "hi-IN" : profile?.preferredLanguage === "bn" ? "bn-IN" : "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile?.preferredLanguage === "hi" ? "hi-IN" : profile?.preferredLanguage === "bn" ? "bn-IN" : "en-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const QUICK_QUESTIONS = [
    "How do I register to vote?",
    "What is NOTA?",
    "What do I need on polling day?",
    "Tell me about EVM & VVPAT",
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <Link
          href="/dashboard"
          style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }}
          aria-label="Back to dashboard"
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f97316, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Vote style={{ width: 16, height: 16, color: "#0b0f1a" }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Matdaan Mitra</div>
            <div style={{ fontSize: 12, color: "var(--muted-fg)", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              AI Assistant
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isSpeaking={isSpeaking} speakText={speakText} />
        ))}

        {isLoading && (
          <div className="flex justify-start slide-in-up">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        {/* Quick questions (show only if no messages beyond welcome) */}
        {messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="glass"
                style={{ fontSize: 14, padding: "8px 16px", borderRadius: 999, cursor: "pointer", color: "inherit", background: "transparent" }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: 16, flexShrink: 0 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 720, margin: "0 auto" }}
        >
          <button
            type="button"
            onClick={toggleVoice}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: isListening ? "rgba(239,68,68,0.15)" : "transparent",
              color: isListening ? "#f87171" : "var(--muted-fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff style={{ width: 20, height: 20 }} /> : <Mic style={{ width: 20, height: 20 }} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask about elections..."}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--foreground)",
              fontSize: 14,
              outline: "none",
            }}
            disabled={isLoading}
            aria-label="Type your message"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              padding: 12,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f97316, #f59e0b)",
              color: "#0b0f1a",
              border: "none",
              cursor: "pointer",
              opacity: (!input.trim() || isLoading) ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Send message"
          >
            <Send style={{ width: 20, height: 20 }} />
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted-fg)", marginTop: 8 }}>
          Matdaan Mitra uses only verified ECI sources.{" "}
          <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee", textDecoration: "none" }}>
            eci.gov.in
          </a>
        </p>
      </div>
    </div>
  );
}
