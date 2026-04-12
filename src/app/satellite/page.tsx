import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SatelliteTracker2DClient from "@/components/SatelliteTracker2DClient";

export default function SatellitePage() {
  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{ background: "rgba(5,10,20,0.9)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}
        className="flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg hover:text-white hover:border-[var(--accent)] transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Portfolio
          </Link>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} className="hidden sm:block" />
          <div className="hidden sm:block">
            <h1 style={{ color: "var(--text)" }} className="font-bold text-sm">
              🛰️ Satellite Ground Track
            </h1>
            <p style={{ color: "var(--muted)" }} className="text-[11px] font-mono mt-0.5">
              Select satellite · SGP4 propagation · 2D Mercator ground track
            </p>
          </div>
        </div>

        <span
          style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.3)" }}
          className="text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5"
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} className="inline-block animate-pulse" />
          LIVE
        </span>
      </div>

      {/* 2D tracker fills remaining height */}
      <div className="flex-1 relative min-h-0">
        <SatelliteTracker2DClient />
      </div>

      {/* Footer strip */}
      <div
        style={{ background: "rgba(5,10,20,0.9)", borderTop: "1px solid var(--border)", flexShrink: 0 }}
        className="px-4 sm:px-6 py-2 flex flex-wrap gap-4 sm:gap-8 text-[11px] font-mono"
      >
        {[
          ["Propagation", "SGP4 / satellite.js"],
          ["Projection",  "Mercator (equirectangular)"],
          ["Track",       "±90 min ground track"],
          ["Orbits",      "LEO · MEO · GEO"],
          ["Update",      "10 s track · 60 fps position"],
        ].map(([k, v]) => (
          <span key={k}>
            <span style={{ color: "var(--muted)" }}>{k}: </span>
            <span style={{ color: "var(--accent)" }}>{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
