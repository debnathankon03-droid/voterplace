"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Globe,
  Eye,
  Volume2,
  User,
  MapPin,
  CheckCircle,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
import { INDIAN_STATES, type SupportedLanguage } from "@/types";

/**
 * SettingsPage allows users to modify their preferences, profile data,
 * accessibility settings (like high-contrast mode), and wipe stored data.
 */
export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [state, setState] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("matdaan-profile");
    if (!savedProfile) {
      router.push("/onboarding");
      return;
    }
    const parsed = JSON.parse(savedProfile);
    setProfile(parsed);
    setLanguage(parsed.preferredLanguage || "en");
    setState(parsed.state || "");
    setTtsEnabled(parsed.accessibilityNeeds?.tts !== false);

    // Load high-contrast preference
    const hc = localStorage.getItem("matdaan-high-contrast");
    if (hc === "true") {
      setHighContrast(true);
      document.documentElement.setAttribute("data-theme", "high-contrast");
    }
  }, [router]);

  const handleSave = () => {
    if (!profile) return;

    const updated = {
      ...profile,
      preferredLanguage: language,
      state,
      accessibilityNeeds: {
        tts: ttsEnabled,
        highContrast,
      },
      updatedAt: Date.now(),
    };

    localStorage.setItem("matdaan-profile", JSON.stringify(updated));
    setProfile(updated);

    // Apply high-contrast
    if (highContrast) {
      document.documentElement.setAttribute("data-theme", "high-contrast");
      localStorage.setItem("matdaan-high-contrast", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("matdaan-high-contrast", "false");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("This will delete your profile and reset the app. Continue?")) {
      localStorage.removeItem("matdaan-profile");
      localStorage.removeItem("matdaan-high-contrast");
      localStorage.removeItem("matdaan-quiz-results");
      document.documentElement.removeAttribute("data-theme");
      router.push("/");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/dashboard"
          style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }}
          aria-label="Back to dashboard"
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Settings style={{ width: 20, height: 20, color: "#f97316" }} />
          <span style={{ fontWeight: 600 }}>Settings</span>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Profile Section */}
          <section className="glass p-6">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-400" />
              Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="settings-state"
                  className="block text-sm font-medium mb-2"
                >
                  State / Union Territory
                </label>
                <select
                  id="settings-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-sm">Age</div>
                  <div className="text-muted-foreground text-xs">
                    {(profile.age as number) || "Not set"}
                  </div>
                </div>
                <div className="text-muted-foreground text-xs">
                  Set during onboarding
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-sm">Voter Status</div>
                  <div className="text-muted-foreground text-xs">
                    {String(profile.voterStatus || "unknown").replace(/_/g, " ")}
                  </div>
                </div>
                <Link
                  href="/onboarding"
                  className="text-xs text-orange-400 hover:underline"
                >
                  Change
                </Link>
              </div>
            </div>
          </section>

          {/* Language Section */}
          <section className="glass p-6">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Language
            </h2>

            <div className="space-y-2">
              {[
                { code: "en" as SupportedLanguage, label: "English", native: "English" },
                { code: "hi" as SupportedLanguage, label: "Hindi", native: "हिन्दी" },
                { code: "bn" as SupportedLanguage, label: "Bengali", native: "বাংলা" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between text-sm ${
                    language === lang.code
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border bg-surface hover:border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        language === lang.code
                          ? "border-orange-500"
                          : "border-muted-foreground"
                      }`}
                    >
                      {language === lang.code && (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <span className="font-medium">{lang.label}</span>
                  </div>
                  <span className="text-muted-foreground">{lang.native}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Accessibility Section */}
          <section className="glass p-6">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Accessibility
            </h2>

            <div className="space-y-4">
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">High Contrast Mode</div>
                  <div className="text-muted-foreground text-xs">
                    Increases contrast for better readability
                  </div>
                </div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    highContrast ? "bg-orange-500" : "bg-surface-hover"
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      highContrast ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      Text-to-Speech
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Read AI responses aloud
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    ttsEnabled ? "bg-orange-500" : "bg-surface-hover"
                  }`}
                  role="switch"
                  aria-checked={ttsEnabled}
                  aria-label="Toggle text-to-speech"
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      ttsEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ flex: 1, padding: "12px 28px" }}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Danger zone */}
          <section className="glass p-6 border-red-500/20">
            <h2 className="font-display text-lg font-bold mb-2 text-red-400">
              Danger Zone
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              This will erase your profile and all local data.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Reset Everything
            </button>
          </section>

          {/* Info */}
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted-fg)", paddingBottom: 32, display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              Matdaan Mitra v0.1.0
            </p>
            <p>
              <MapPin style={{ width: 12, height: 12, display: "inline" }} /> Data source:{" "}
              <a
                href="https://eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#22d3ee", textDecoration: "none" }}
              >
                eci.gov.in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
