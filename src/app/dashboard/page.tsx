"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Vote,
  MessageCircle,
  Brain,
  Shield,
  MapPin,
  Mic,
  Settings,
  ExternalLink,
  Calendar,
  ChevronRight,
  LogOut,
  Sparkles,
  AlertTriangle,
  UserPlus,
  FileText,
  Scale,
  Search,
  ClipboardCheck,
  Clock,
  Phone,
  BarChart3,
  Trophy,
  BookOpen,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import type { UserProfile, ElectionPhase, ActionCard } from "@/types";
import { getActions, getPhaseInfo } from "@/lib/decisionEngine";
import GoogleLogin from "@/components/GoogleLogin";

const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  "book-open": BookOpen,
  "shield-check": Shield,
  "alert-triangle": AlertTriangle,
  "user-plus": UserPlus,
  "file-text": FileText,
  scale: Scale,
  search: Search,
  "map-pin": MapPin,
  calendar: Calendar,
  vote: Vote,
  "clipboard-check": ClipboardCheck,
  "check-circle": CheckCircle,
  clock: Clock,
  phone: Phone,
  "bar-chart": BarChart3,
  trophy: Trophy,
  "help-circle": HelpCircle,
  brain: Brain,
};

const PHASE_ORDER: ElectionPhase[] = [
  "announced",
  "nomination",
  "campaigning",
  "silence_period",
  "polling_day",
  "counting",
];

const SIDEBAR_LINKS = [
  { href: "/chat", icon: MessageCircle, label: "Chat Assistant" },
  { href: "/quiz", icon: Brain, label: "Election Quiz" },
  { href: "/myths", icon: Shield, label: "Myth Buster" },
  { href: "/locator", icon: MapPin, label: "Find Polling Station" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [phase] = useState<ElectionPhase>("no_election");
  const [actions, setActions] = useState<ActionCard[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("matdaan-profile");
    if (!saved) {
      router.push("/onboarding");
      return;
    }
    const parsed = JSON.parse(saved) as UserProfile;
    setProfile(parsed);
    setActions(getActions(parsed, phase));

    // Apply high-contrast theme if saved
    const hc = localStorage.getItem("matdaan-high-contrast");
    if (hc === "true") {
      document.documentElement.setAttribute("data-theme", "high-contrast");
    }
  }, [router, phase]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const phaseInfo = getPhaseInfo(phase);
  const greeting = profile.age < 18
    ? `Welcome, Future Voter! 🌟`
    : profile.voterStatus === "registered"
    ? `Welcome back, Voter! 🗳️`
    : `Welcome! Let's get you registered ✨`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f97316, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Vote style={{ width: 16, height: 16, color: "#0b0f1a" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontWeight: 700 }}>Matdaan Mitra</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--muted-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Voice mode"
            >
              <Mic style={{ width: 20, height: 20 }} />
            </button>
            <Link
              href="/settings"
              style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "var(--muted-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Settings"
            >
              <Settings style={{ width: 20, height: 20 }} />
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("matdaan-profile");
                router.push("/");
              }}
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--muted-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Log out"
            >
              <LogOut style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex" }}>
        {/* Sidebar */}
        <aside className="hidden lg:flex" style={{ flexDirection: "column", width: 260, borderRight: "1px solid rgba(255,255,255,0.08)", padding: 16, gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-fg)", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "0 12px", marginBottom: 8 }}>
            Quick Links
          </div>
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, fontSize: 14, textDecoration: "none", color: "inherit" }}
            >
              <link.icon style={{ width: 20, height: 20, color: "var(--muted-fg)" }} />
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="glass" style={{ marginTop: "auto", padding: 16, fontSize: 14 }}>
            <div style={{ color: "var(--muted-fg)", fontSize: 12, marginBottom: 4 }}>Your Profile</div>
            <div style={{ fontWeight: 500 }}>{profile.state}</div>
            <div style={{ color: "var(--muted-fg)", marginBottom: 12 }}>
              Age {profile.age} · {profile.voterStatus.replace(/_/g, " ")}
            </div>
            <GoogleLogin />
          </div>
        </aside>

        {/* Main Content */}
        <main id="main-content" style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            {/* Greeting */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{greeting}</h1>
              <p style={{ color: "var(--muted-fg)", fontSize: 15 }}>
                Here&#39;s your personalized election guide based on your profile.
              </p>
            </div>

            {/* Election Phase Banner */}
            <div className="glass p-6 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-cyan-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${phase === "polling_day" ? "bg-red-500 pulse-glow" : phase === "no_election" ? "bg-green-500" : "bg-orange-500 pulse-glow"}`} />
                  <span className="text-sm font-medium text-muted-foreground">Current Phase</span>
                </div>
                <h2 className="font-display text-xl font-bold mb-1">{phaseInfo.label}</h2>
                <p className="text-muted-foreground text-sm">{phaseInfo.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-10 overflow-x-auto pb-4">
              <div className="flex min-w-[600px]">
                {PHASE_ORDER.map((p, i) => {
                  const info = getPhaseInfo(p);
                  const isActive = p === phase;
                  const isPast = PHASE_ORDER.indexOf(phase) > i;
                  return (
                    <div key={p} className={`timeline-step ${isActive ? "active" : ""}`}>
                      <div
                        className={`timeline-dot ${
                          isActive
                            ? "!bg-orange-500 !border-orange-500"
                            : isPast
                            ? "!bg-green-600 !border-green-600"
                            : ""
                        }`}
                      >
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      <span
                        className={`text-xs mt-2 text-center max-w-[80px] ${
                          isActive ? "text-orange-400 font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Cards */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Recommended for You
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
              {actions.map((action, i) => {
                const IconComp = ICON_MAP[action.icon] || HelpCircle;
                const isUrgent = action.priority === 0;
                return (
                  <div
                    key={action.id}
                    className={`glass glass-hover p-5 flex flex-col ${
                      isUrgent ? "border-orange-500/40 bg-orange-500/5" : ""
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {isUrgent && (
                      <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
                        ⚡ Urgent
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto pt-3">
                      {action.cta.type === "external" ? (
                        <a
                          href={action.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {action.cta.label}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={action.cta.href}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {action.cta.label}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voter Pledge */}
            <div className="glass p-6 mb-8 text-center" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1))", border: "1px solid rgba(34,211,238,0.2)" }}>
              <h2 className="font-display text-xl font-bold mb-2">Take the Voter Pledge</h2>
              <p className="text-muted-foreground text-sm mb-4">
                "I pledge to uphold the democratic traditions of our country and the dignity of free, fair and peaceful elections, and to vote in every election fearlessly."
              </p>
              <button 
                className="btn-primary" 
                style={{ padding: "10px 24px", fontSize: 14 }}
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.innerText = "Pledge Taken! 🇮🇳";
                  target.style.background = "#16a34a";
                  target.style.borderColor = "#16a34a";
                  target.disabled = true;
                }}
              >
                I Pledge to Vote
              </button>
            </div>

            {/* Mobile Quick Links */}
            <div className="lg:hidden glass" style={{ padding: 16, marginBottom: 32 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Quick Links</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SIDEBAR_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: "var(--surface)", fontSize: 14, textDecoration: "none", color: "inherit" }}
                  >
                    <link.icon style={{ width: 16, height: 16, color: "#f97316" }} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
