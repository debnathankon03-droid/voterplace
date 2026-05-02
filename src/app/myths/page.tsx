"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  XCircle,
  CheckCircle,
  ChevronDown,
  Search,
  ExternalLink,
  Send,
} from "lucide-react";
import mythsData from "@/data/myths.json";
import type { MythFact } from "@/types";

const myths = mythsData as MythFact[];
const categories = [...new Set(myths.map((m) => m.category))];

/**
 * MythsPage presents common election myths versus facts in a card-based UI,
 * allowing users to search and learn about electoral realities.
 */
export default function MythsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitMyth, setSubmitMyth] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filteredMyths = myths.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.myth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitMyth = () => {
    if (!submitMyth.trim()) return;
    // In production, save to Firestore for review
    console.log("Submitted myth for review:", submitMyth);
    setSubmitted(true);
    setSubmitMyth("");
    setTimeout(() => {
      setSubmitted(false);
      setShowSubmit(false);
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }} aria-label="Back">
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield style={{ width: 20, height: 20, color: "#34d399" }} />
          <span style={{ fontWeight: 600 }}>Myth vs Fact</span>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Intro */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Don&#39;t Fall for <span className="gradient-text">Election Myths</span>
            </h1>
            <p style={{ color: "var(--muted-fg)", fontSize: 15 }}>
              Tap any claim to reveal the verified fact behind it.
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--muted-fg)" }} />
              <input
                type="text"
                placeholder="Search myths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
                aria-label="Search myths"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: !selectedCategory ? "#f97316" : "var(--muted-fg)",
                  background: !selectedCategory ? "rgba(249,115,22,0.15)" : "var(--surface)",
                  border: !selectedCategory ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    color: selectedCategory === cat ? "#f97316" : "var(--muted-fg)",
                    background: selectedCategory === cat ? "rgba(249,115,22,0.15)" : "var(--surface)",
                    border: selectedCategory === cat ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Myths List */}
          <div className="space-y-3 mb-8">
            {filteredMyths.map((myth) => {
              const isExpanded = expandedId === myth.id;
              return (
                <button
                  key={myth.id}
                  onClick={() => setExpandedId(isExpanded ? null : myth.id)}
                  className="w-full glass text-left transition-all hover:border-orange-500/20"
                  aria-expanded={isExpanded}
                >
                  <div className="p-4">
                    {/* Myth (claim) */}
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                          Myth
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{myth.myth}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Fact (revealed on expand) */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border slide-in-up">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
                              Fact
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {myth.fact}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Source: {myth.source}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredMyths.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No myths match your search.</p>
              </div>
            )}
          </div>

          {/* Submit a Myth */}
          <div className="glass p-6">
            <button
              onClick={() => setShowSubmit(!showSubmit)}
              className="w-full flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-sm">Heard a myth?</h3>
                <p className="text-xs text-muted-foreground">Submit it for our team to fact-check.</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSubmit ? "rotate-180" : ""}`} />
            </button>

            {showSubmit && (
              <div className="mt-4 pt-4 border-t border-border slide-in-up">
                {submitted ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Thank you! We&#39;ll review this.
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="text"
                      value={submitMyth}
                      onChange={(e) => setSubmitMyth(e.target.value)}
                      placeholder="Describe the myth you heard..."
                      style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
                      aria-label="Submit a myth"
                    />
                    <button
                      onClick={handleSubmitMyth}
                      disabled={!submitMyth.trim()}
                      style={{ padding: 10, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#0b0f1a", border: "none", cursor: "pointer", opacity: !submitMyth.trim() ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                      aria-label="Submit"
                    >
                      <Send style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
