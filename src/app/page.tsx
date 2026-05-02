"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Vote,
  Shield,
  MapPin,
  MessageCircle,
  Brain,
  Mic,
  ChevronRight,
  Sparkles,
  Users,
  CalendarDays,
  Globe,
  ArrowRight,
} from "lucide-react";
import Hero from "@/components/landing/Hero";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Chat Assistant",
    description: "Ask anything about elections. Get accurate, sourced answers in your language.",
    gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
  },
  {
    icon: Brain,
    title: "Election Quiz",
    description: "Test and build your election knowledge with AI-generated quizzes.",
    gradient: "linear-gradient(135deg, #22d3ee, #3b82f6)",
  },
  {
    icon: Shield,
    title: "Myth Buster",
    description: "Separate fact from fiction. Counter election misinformation instantly.",
    gradient: "linear-gradient(135deg, #34d399, #16a34a)",
  },
  {
    icon: MapPin,
    title: "Polling Locator",
    description: "Find your nearest polling station with directions on Google Maps.",
    gradient: "linear-gradient(135deg, #a78bfa, #9333ea)",
  },
  {
    icon: Mic,
    title: "Voice-First",
    description: "Speak your questions. Hear the answers. Fully accessible by design.",
    gradient: "linear-gradient(135deg, #fb7185, #db2777)",
  },
  {
    icon: CalendarDays,
    title: "Calendar Sync",
    description: "Never miss election day. Add deadlines directly to your Google Calendar.",
    gradient: "linear-gradient(135deg, #facc15, #f97316)",
  },
];

const STATS = [
  { value: "950M+", label: "Eligible Voters" },
  { value: "10L+", label: "Polling Stations" },
  { value: "543", label: "Lok Sabha Seats" },
  { value: "28+8", label: "States & UTs" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell Us About You", desc: "Your state, age, and registration status — that's all we need.", icon: Users },
  { step: "02", title: "Get Your Dashboard", desc: "See exactly what you need to do based on your situation and the election timeline.", icon: Sparkles },
  { step: "03", title: "Ask, Learn, Act", desc: "Chat with AI, take quizzes, find your polling station, and add dates to your calendar.", icon: Globe },
];

/**
 * Main landing page for Matdaan Mitra.
 * Serves as the marketing hero and introduction to the AI Election Assistant.
 * Fully responsive and accessible.
 */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "12px 16px" }}>
        <div className="glass" style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f97316, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Vote style={{ width: 20, height: 20, color: "#0b0f1a" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontWeight: 700, fontSize: 18 }}>
              Matdaan <span className="gradient-text">Mitra</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="#features" style={{ color: "var(--muted-fg)", textDecoration: "none", fontSize: 14, display: "none" }} className="md:!inline">
              Features
            </Link>
            <Link href="#how-it-works" style={{ color: "var(--muted-fg)", textDecoration: "none", fontSize: 14, display: "none" }} className="md:!inline">
              How It Works
            </Link>
            <Link href="/onboarding" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
              Get Started <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content">
        <Hero />

        {/* Features Section */}
        <section id="features" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
                Everything You Need to <span className="gradient-text">Vote Confidently</span>
              </h2>
              <p style={{ color: "var(--muted-fg)", maxWidth: 520, margin: "0 auto", fontSize: 15 }}>
                From registration to results — Matdaan Mitra guides you through
                every step with AI-powered, sourced information.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="glass glass-hover"
                  style={{ padding: "28px 24px" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: feature.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <feature.icon style={{ width: 26, height: 26, color: "white" }} />
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{feature.title}</h3>
                  <p style={{ color: "var(--muted-fg)", fontSize: 14, lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700 }}>
                Get Started in <span className="gradient-text-accent">30 Seconds</span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="glass glass-hover"
                  style={{ padding: "28px 28px", display: "flex", alignItems: "center", gap: 24 }}
                >
                  <div style={{
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.15))",
                    border: "1px solid rgba(249,115,22,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display), Outfit, sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#f97316",
                  }}>
                    {item.step}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      <item.icon style={{ width: 20, height: 20, color: "#f97316", flexShrink: 0 }} />
                      {item.title}
                    </h3>
                    <p style={{ color: "var(--muted-fg)", fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: "80px 24px" }}>
          <div className="glass" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", padding: "56px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(6,182,212,0.04))", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 10 }}>
              <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 16 }}>
                Ready to Be an Informed Voter?
              </h2>
              <p style={{ color: "var(--muted-fg)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontSize: 15 }}>
                Your democracy needs you. Let Matdaan Mitra guide you through
                every step — from registration to results.
              </p>
              <Link href="/onboarding" className="btn-primary" style={{ padding: "16px 44px", fontSize: 16 }}>
                Begin Now <ArrowRight style={{ width: 20, height: 20 }} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px 32px", fontSize: 14, color: "var(--muted-fg)", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Vote style={{ width: 16, height: 16, color: "#f97316" }} />
            <span>Matdaan Mitra © {new Date().getFullYear()}</span>
          </div>
          <p>
            Source:{" "}
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee", textDecoration: "none" }}>
              eci.gov.in
            </a>
            {" "}· Educational tool, not an official ECI service.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/chat" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Chat</Link>
            <Link href="/quiz" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Quiz</Link>
            <Link href="/myths" style={{ color: "var(--muted-fg)", textDecoration: "none" }}>Myths</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
