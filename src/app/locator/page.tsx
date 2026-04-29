"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";

export default function LocatorPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);



  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please enable location services."
            : "Unable to get your location. Please try again."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    // Auto-request location on mount
    getLocation();
  }, [getLocation]);

  const openGoogleMaps = () => {
    if (location) {
      window.open(
        `https://www.google.com/maps/search/polling+station/@${location.lat},${location.lng},15z`,
        "_blank"
      );
    }
  };

  const searchLocation = () => {
    if (searchQuery.trim()) {
      window.open(
        `https://www.google.com/maps/search/polling+station+${encodeURIComponent(searchQuery)}`,
        "_blank"
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ padding: 8, borderRadius: 8, textDecoration: "none", color: "inherit" }} aria-label="Back">
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin style={{ width: 20, height: 20, color: "#a78bfa" }} />
          <span style={{ fontWeight: 600 }}>Polling Station Locator</span>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, padding: 24 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-display), Outfit, sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Find Your <span className="gradient-text">Polling Station</span>
            </h1>
            <p style={{ color: "var(--muted-fg)", fontSize: 15 }}>
              Locate your designated polling booth and get directions.
            </p>
          </div>

          <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Search by area name</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your area, pincode, or constituency..."
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
                onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                aria-label="Search location"
              />
              <button
                onClick={searchLocation}
                disabled={!searchQuery.trim()}
                style={{ padding: 10, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#0b0f1a", border: "none", cursor: "pointer", opacity: !searchQuery.trim() ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Search style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Map area */}
          <div className="glass overflow-hidden mb-6">
            <div
              ref={mapRef}
              className="h-[400px] bg-surface flex items-center justify-center relative"
            >
              {loading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Getting your location...</p>
                </div>
              ) : error ? (
                <div className="text-center px-6">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="text-red-400 text-sm mb-3">{error}</p>
                  <button onClick={getLocation} className="btn-secondary text-sm">
                    Try Again
                  </button>
                </div>
              ) : location ? (
                <div style={{ width: "100%", height: "100%" }}>
                  <iframe
                    title="Polling Station Map"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=polling+station+near+${location.lat},${location.lng}&z=14&output=embed`}
                  />
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ fontSize: 13, color: "var(--muted-fg)" }}>
                      📍 {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                    </p>
                    <button
                      onClick={openGoogleMaps}
                      className="btn-primary"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                      <Navigation style={{ width: 14, height: 14 }} />
                      Open Full Map
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Enable location to find nearby polling stations.
                  </p>
                  <button onClick={getLocation} className="btn-primary text-sm mt-3">
                    <Navigation className="w-4 h-4" />
                    Use My Location
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="glass p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                ECI Voter Helpline
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                Call <strong className="text-foreground">1950</strong> (toll-free) to find your exact polling station.
              </p>
              <a
                href="tel:1950"
                className="text-sm text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Call Now <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="glass p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400" />
                Official Voter Portal
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                Check your booth details on the official ECI Voter Portal.
              </p>
              <a
                href="https://voterportal.eci.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Visit Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Tips */}
          <div className="glass p-4">
            <h3 className="font-semibold text-sm mb-3">🗳️ Polling Day Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                You can ONLY vote at your assigned polling station — not at any other.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                Carry your Voter ID (EPIC) or any approved photo ID.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                Arrive early to avoid long queues. Polling usually starts at 7 AM.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                If you&#39;re in the queue by closing time (6 PM), you will be allowed to vote.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
