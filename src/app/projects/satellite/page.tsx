import Nav from "@/components/Nav";
import Link from "next/link";
import SatelliteGlobeClient from "@/components/SatelliteGlobeClient";

export default function SatellitePage() {
  return (
    <>
      <Nav />
      <div className="pt-12 flex flex-col" style={{ minHeight: "100vh" }}>
        {/* Header bar */}
        <div
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3"
        >
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">🛰️ Real-Time Satellite Tracker</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono mt-0.5">
              SGP4 propagation · 18 satellites · live orbital mechanics · drag to rotate · click to inspect
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              style={{ background: "var(--surface2)", color: "var(--green)", border: "1px solid var(--green)" }}
              className="text-[10px] font-mono px-3 py-1 rounded-full"
            >
              ● LIVE
            </span>
            <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
          </div>
        </div>

        {/* Globe — takes remaining height */}
        <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 120px)" }}>
          <SatelliteGlobeClient />
        </div>

        {/* Tech callout strip */}
        <div
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
          className="px-6 py-3 flex flex-wrap gap-6 text-xs font-mono"
        >
          {[
            ["Propagation", "SGP4 / satellite.js"],
            ["Rendering", "Three.js WebGL"],
            ["Data", "TLE (Two-Line Element sets)"],
            ["Orbits", "LEO · MEO · GEO"],
            ["Update rate", "60 fps realtime"],
          ].map(([k, v]) => (
            <span key={k}>
              <span style={{ color: "var(--muted)" }}>{k}: </span>
              <span style={{ color: "var(--accent)" }}>{v}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
