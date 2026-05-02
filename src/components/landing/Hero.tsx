import Link from "next/link";
import { ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const STATS = [
  { value: "950M+", label: "Eligible Voters" },
  { value: "10L+", label: "Polling Stations" },
  { value: "543", label: "Lok Sabha Seats" },
  { value: "28+8", label: "States & UTs" },
];

/**
 * Hero component for the landing page.
 * Displays the main value proposition, key stats, and call-to-actions.
 */
export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
        <div style={{ position: "absolute", top: "25%", left: "25%", width: 400, height: 400, background: "rgba(249,115,22,0.08)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "25%", right: "25%", width: 400, height: 400, background: "rgba(6,182,212,0.06)", borderRadius: "50%", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div className="glass" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 999, fontSize: 14, marginBottom: 40, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s" }}>
          <Sparkles style={{ width: 16, height: 16, color: "#f97316" }} />
          <span style={{ color: "var(--muted-fg)" }}>Powered by Google Gemini AI</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s 0.1s" }}>
          Your Vote.<br />
          <span className="gradient-text">Your Voice.</span><br />
          Your Guide.
        </h1>

        <p style={{ fontSize: "clamp(15px, 2.5vw, 20px)", color: "var(--muted-fg)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.6, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s 0.2s" }}>
          Matdaan Mitra is your AI-powered election companion — personalized guidance on eligibility, registration, polling, and your rights as an Indian voter.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 64, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s 0.3s" }}>
          <Link href="/onboarding" className="btn-primary" style={{ padding: "16px 36px", fontSize: 16 }}>
            Start Your Journey
            <ChevronRight style={{ width: 20, height: 20 }} />
          </Link>
          <Link href="/chat" className="btn-secondary" style={{ padding: "16px 36px", fontSize: 16 }}>
            <MessageCircle style={{ width: 20, height: 20 }} />
            Ask a Question
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 640, margin: "0 auto", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s 0.4s" }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="glass" style={{ padding: "20px 12px", textAlign: "center" }}>
              <div className="gradient-text" style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
