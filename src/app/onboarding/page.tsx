"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Vote,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Globe,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { INDIAN_STATES, type VoterStatus, type SupportedLanguage } from "@/types";

const STEPS = ["Location", "Age & Status", "Language"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState("");
  const [constituency, setConstituency] = useState("");
  const [age, setAge] = useState("");
  const [voterStatus, setVoterStatus] = useState<VoterStatus>("unknown");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [saving, setSaving] = useState(false);

  const canProceed = () => {
    if (step === 0) return state !== "";
    if (step === 1) return age !== "" && voterStatus !== "unknown";
    if (step === 2) return true;
    return false;
  };

  const handleAgeChange = (value: string) => {
    setAge(value);
    const numAge = parseInt(value);
    if (!isNaN(numAge) && numAge < 18) {
      setVoterStatus("under_18");
    } else if (voterStatus === "under_18") {
      setVoterStatus("unknown");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const profile = {
      uid: `local-${Date.now()}`,
      age: parseInt(age),
      state,
      constituency: constituency || undefined,
      voterStatus,
      preferredLanguage: language,
      onboardingComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem("matdaan-profile", JSON.stringify(profile));
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f97316, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Vote style={{ width: 18, height: 18, color: "#0b0f1a" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontWeight: 700, fontSize: 16 }}>Matdaan Mitra</span>
          </Link>
          <div style={{ fontSize: 14, color: "var(--muted-fg)" }}>
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    height: 6,
                    width: "100%",
                    borderRadius: 999,
                    background: i <= step
                      ? "linear-gradient(90deg, #f97316, #fbbf24)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 0.4s",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: i <= step ? "#f97316" : "var(--muted-fg)" }}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          {/* Glass card wrapping the form */}
          <div className="glass" style={{ padding: "40px 36px", marginBottom: 0 }}>

            {/* Step 0: Location */}
            {step === 0 && (
              <div className="slide-in-up">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.15))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin style={{ width: 28, height: 28, color: "#f97316" }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>Where do you vote?</h2>
                    <p style={{ color: "var(--muted-fg)", fontSize: 14, marginTop: 4 }}>
                      Select your state to personalize your experience.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label htmlFor="state-select" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                      State / Union Territory *
                    </label>
                    <select
                      id="state-select"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "var(--surface)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--foreground)",
                        fontSize: 14,
                        outline: "none",
                        appearance: "none" as const,
                      }}
                    >
                      <option value="">Select your state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="constituency-input" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                      Constituency <span style={{ color: "var(--muted-fg)" }}>(optional)</span>
                    </label>
                    <input
                      id="constituency-input"
                      type="text"
                      value={constituency}
                      onChange={(e) => setConstituency(e.target.value)}
                      placeholder="e.g., South Delhi, Amethi"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "var(--surface)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--foreground)",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Age & Status */}
            {step === 1 && (
              <div className="slide-in-up">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Calendar style={{ width: 28, height: 28, color: "#06b6d4" }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>Tell us about yourself</h2>
                    <p style={{ color: "var(--muted-fg)", fontSize: 14, marginTop: 4 }}>
                      This helps us tailor guidance just for you.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <label htmlFor="age-input" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                      Your Age *
                    </label>
                    <input
                      id="age-input"
                      type="number"
                      min="14"
                      max="120"
                      value={age}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      placeholder="Enter your age"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "var(--surface)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--foreground)",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                    {parseInt(age) > 0 && parseInt(age) < 18 && (
                      <p style={{ fontSize: 14, color: "#f97316", marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <Sparkles style={{ width: 16, height: 16 }} />
                        You&#39;re a future voter! We&#39;ll help you prepare.
                      </p>
                    )}
                  </div>

                  {(parseInt(age) >= 18 || age === "") && (
                    <div>
                      <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                        Are you registered to vote? *
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { value: "registered" as VoterStatus, label: "Yes, I'm registered", desc: "I have my Voter ID / EPIC" },
                          { value: "eligible_unregistered" as VoterStatus, label: "Not yet registered", desc: "I haven't applied for a Voter ID" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setVoterStatus(opt.value)}
                            style={{
                              width: "100%",
                              padding: "16px 20px",
                              borderRadius: 12,
                              border: voterStatus === opt.value ? "1.5px solid #f97316" : "1px solid rgba(255,255,255,0.08)",
                              background: voterStatus === opt.value ? "rgba(249,115,22,0.08)" : "var(--surface)",
                              textAlign: "left" as const,
                              cursor: "pointer",
                              color: "inherit",
                              transition: "all 0.2s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  border: `2px solid ${voterStatus === opt.value ? "#f97316" : "var(--muted-fg)"}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {voterStatus === opt.value && (
                                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316" }} />
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{opt.label}</div>
                                <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 2 }}>{opt.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Language */}
            {step === 2 && (
              <div className="slide-in-up">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(34,197,94,0.15))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Globe style={{ width: 28, height: 28, color: "#10b981" }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>Choose your language</h2>
                    <p style={{ color: "var(--muted-fg)", fontSize: 14, marginTop: 4 }}>
                      We&#39;ll show content in your preferred language.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { code: "en" as SupportedLanguage, label: "English", native: "English" },
                    { code: "hi" as SupportedLanguage, label: "Hindi", native: "हिन्दी" },
                    { code: "bn" as SupportedLanguage, label: "Bengali", native: "বাংলা" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        borderRadius: 12,
                        border: language === lang.code ? "1.5px solid #f97316" : "1px solid rgba(255,255,255,0.08)",
                        background: language === lang.code ? "rgba(249,115,22,0.08)" : "var(--surface)",
                        textAlign: "left" as const,
                        cursor: "pointer",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: `2px solid ${language === lang.code ? "#f97316" : "var(--muted-fg)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {language === lang.code && (
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316" }} />
                          )}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 15 }}>{lang.label}</span>
                      </div>
                      <span style={{ color: "var(--muted-fg)", fontSize: 14 }}>{lang.native}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons — outside the glass card, with clear spacing */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            paddingTop: 0,
          }}>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-secondary"
              style={{
                padding: "12px 28px",
                opacity: step === 0 ? 0.3 : 1,
                pointerEvents: step === 0 ? "none" as const : "auto" as const,
              }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary"
                style={{
                  padding: "12px 32px",
                  opacity: !canProceed() ? 0.4 : 1,
                  pointerEvents: !canProceed() ? "none" as const : "auto" as const,
                }}
              >
                Continue
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-primary"
                style={{ padding: "12px 32px" }}
              >
                {saving ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(11,15,26,0.3)", borderTop: "2px solid #0b0f1a", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle style={{ width: 16, height: 16 }} />
                    Finish Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
