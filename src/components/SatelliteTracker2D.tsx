"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as satellite from "satellite.js";
import { feature, mesh } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import { TLES } from "@/lib/data/tles";

// Pre-parse satrecords once
const SATRECORDS = TLES.map((tle) => ({
  ...tle,
  satrec: satellite.twoline2satrec(tle.line1, tle.line2),
}));

// ── Projection helpers ──────────────────────────────────────────
const lonToX = (lon: number, W: number) => ((lon + 180) / 360) * W;
const latToY = (lat: number, H: number) => ((90 - lat) / 180) * H;

// ── Draw GeoJSON geometry onto ctx ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geoPath(ctx: CanvasRenderingContext2D, geom: any, W: number, H: number) {
  if (!geom) return;
  const type: string = geom.type;
  // Collect rings / line-strings into a uniform shape
  let ringGroups: number[][][] = [];
  if (type === "Polygon")            ringGroups = geom.coordinates;
  else if (type === "MultiPolygon")  geom.coordinates.forEach((p: number[][][]) => p.forEach((r) => ringGroups.push(r)));
  else if (type === "LineString")    ringGroups = [geom.coordinates];
  else if (type === "MultiLineString") ringGroups = geom.coordinates;
  else if (type === "GeometryCollection")
    geom.geometries.forEach((g: unknown) => geoPath(ctx, g, W, H));

  for (const ring of ringGroups) {
    let prevLon: number | null = null;
    let first = true;
    for (const coord of ring) {
      const lon = coord[0], lat = coord[1];
      // Break path at anti-meridian to avoid lines shooting across the map
      if (prevLon !== null && Math.abs(lon - prevLon) > 180) first = true;
      const x = lonToX(lon, W), y = latToY(lat, H);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      prevLon = lon;
    }
  }
}

// ── Offscreen world canvas (pre-rendered, reused every frame) ──
function buildWorldCanvas(W: number, H: number, topology: Topology<Objects>): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const ctx = off.getContext("2d")!;

  // Background
  ctx.fillStyle = "#050a14";
  ctx.fillRect(0, 0, W, H);

  // ── Grid ──────────────────────────────────────────────────────
  ctx.lineWidth = 0.4;
  ctx.strokeStyle = "rgba(30,58,95,0.4)";
  ctx.setLineDash([]);
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = lonToX(lon, W);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = latToY(lat, H);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Equator
  ctx.strokeStyle = "rgba(0,212,255,0.15)";
  ctx.lineWidth = 0.8;
  const eqY = latToY(0, H);
  ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke();

  // Tropics
  ctx.strokeStyle = "rgba(30,58,95,0.55)";
  ctx.lineWidth = 0.4;
  ctx.setLineDash([4, 5]);
  [23.5, -23.5].forEach((lat) => {
    const y = latToY(lat, H);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });
  ctx.setLineDash([]);

  // ── Land fill ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landFeature = feature(topology, (topology.objects as any).land);
  ctx.beginPath();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (landFeature as any).coordinates?.forEach((poly: number[][][]) =>
    poly.forEach((ring) => geoPath(ctx, { type: "LineString", coordinates: ring }, W, H))
  );
  if ((landFeature as { type: string }).type === "Feature") {
    geoPath(ctx, (landFeature as { geometry: unknown }).geometry, W, H);
  } else {
    // FeatureCollection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (landFeature as any).features?.forEach((f: { geometry: unknown }) =>
      geoPath(ctx, f.geometry, W, H)
    );
  }
  ctx.fillStyle = "rgba(18,44,70,0.75)";
  ctx.fill();

  // ── Country borders ────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const borders = mesh(topology, (topology.objects as any).countries, (a: unknown, b: unknown) => a !== b);
  ctx.beginPath();
  geoPath(ctx, borders, W, H);
  ctx.strokeStyle = "rgba(0,212,255,0.18)";
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // ── Degree labels ──────────────────────────────────────────────
  ctx.font = `${Math.max(9, Math.min(10, W * 0.011))}px monospace`;
  ctx.fillStyle = "rgba(100,116,139,0.55)";
  for (let lon = -150; lon <= 180; lon += 30) {
    ctx.fillText(`${lon}°`, lonToX(lon, W) + 2, H - 4);
  }
  for (let lat = -60; lat <= 90; lat += 30) {
    ctx.fillText(`${lat}°`, 3, latToY(lat, H) - 2);
  }
  ctx.fillStyle = "rgba(0,212,255,0.45)";
  ctx.fillText("EQ", 3, eqY - 3);

  return off;
}

// ── Track computation ──────────────────────────────────────────
type TrackPoint = { x: number; y: number; past: boolean; _lon: number };

function computeTrack(
  satrec: ReturnType<typeof satellite.twoline2satrec>,
  now: Date,
  W: number,
  H: number
): TrackPoint[] {
  const pts: TrackPoint[] = [];
  for (let m = -90; m <= 91; m++) {
    const t = new Date(now.getTime() + m * 60_000);
    try {
      const pv = satellite.propagate(satrec, t);
      if (!pv || typeof pv.position === "boolean" || !pv.position) continue;
      const gmst = satellite.gstime(t);
      const gd   = satellite.eciToGeodetic(pv.position, gmst);
      const lat  = satellite.degreesLat(gd.latitude);
      const lon  = satellite.degreesLong(gd.longitude);
      pts.push({ x: lonToX(lon, W), y: latToY(lat, H), past: m < 0, _lon: lon });
    } catch { /**/ }
  }
  return pts;
}

function splitAtMeridian(pts: TrackPoint[]): TrackPoint[][] {
  const segs: TrackPoint[][] = [[]];
  for (let i = 0; i < pts.length; i++) {
    if (i > 0 && Math.abs(pts[i]._lon - pts[i - 1]._lon) > 180) segs.push([]);
    segs[segs.length - 1].push(pts[i]);
  }
  return segs.filter((s) => s.length >= 2);
}

// ── Component ──────────────────────────────────────────────────
export default function SatelliteTracker2D() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const animRef        = useRef<number>(0);
  const worldRef       = useRef<HTMLCanvasElement | null>(null);
  const trackCacheRef  = useRef<{ ts: number; pts: TrackPoint[] } | null>(null);
  const selectedRef    = useRef(0);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [info, setInfo] = useState<{
    lat: number; lon: number; alt: number; name: string; type: string; color: string;
  } | null>(null);

  // Keep ref in sync (used inside rAF closure without re-subscribing)
  useEffect(() => {
    selectedRef.current = selectedIdx;
    trackCacheRef.current = null;
  }, [selectedIdx]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !worldRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const now = new Date();
    const rec = SATRECORDS[selectedRef.current];

    // Blit pre-rendered world map
    ctx.drawImage(worldRef.current, 0, 0);

    // Recompute track every 10 s or on satellite change
    if (!trackCacheRef.current || now.getTime() - trackCacheRef.current.ts > 10_000) {
      trackCacheRef.current = { ts: now.getTime(), pts: computeTrack(rec.satrec, now, W, H) };
    }
    const segments = splitAtMeridian(trackCacheRef.current.pts);

    // ── Ground track ─────────────────────────────────────────────
    const color = rec.color;
    segments.forEach((seg) => {
      const past   = seg.filter((p) => p.past);
      const future = seg.filter((p) => !p.past);

      if (past.length >= 2) {
        ctx.beginPath();
        past.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = `${color}35`;
        ctx.lineWidth   = 1.2;
        ctx.setLineDash([]);
        ctx.stroke();
      }
      if (future.length >= 2) {
        ctx.beginPath();
        future.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = `${color}c0`;
        ctx.lineWidth   = 1.8;
        ctx.stroke();
      }
    });

    // ── Current position ─────────────────────────────────────────
    try {
      const pv = satellite.propagate(rec.satrec, now);
      if (pv && typeof pv.position !== "boolean" && pv.position) {
        const gmst = satellite.gstime(now);
        const gd   = satellite.eciToGeodetic(pv.position, gmst);
        const lat  = satellite.degreesLat(gd.latitude);
        const lon  = satellite.degreesLong(gd.longitude);
        const cx   = lonToX(lon, W), cy = latToY(lat, H);

        // Crosshairs
        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth   = 0.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(cx, 0);  ctx.lineTo(cx, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy);  ctx.lineTo(W, cy); ctx.stroke();
        ctx.setLineDash([]);

        // Glow ring
        const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 18);
        grad.addColorStop(0, `${color}70`);
        grad.addColorStop(1, `${color}00`);
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        // Dot
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Name label
        ctx.font      = `bold ${Math.max(10, Math.min(13, W * 0.013))}px monospace`;
        ctx.fillStyle = color;
        ctx.fillText(rec.name, cx + 8, cy - 8);

        setInfo({
          lat:   parseFloat(lat.toFixed(2)),
          lon:   parseFloat(lon.toFixed(2)),
          alt:   parseFloat(gd.height.toFixed(0)),
          name:  rec.name,
          type:  rec.type,
          color: rec.color,
        });
      }
    } catch { /**/ }

    animRef.current = requestAnimationFrame(draw);
  }, []); // stable — uses refs only

  // Load world data + start loop
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setup = async () => {
      // Dynamic import avoids SSR issues with the large JSON
      const worldData = (await import("world-atlas/countries-110m.json")) as unknown as Topology<Objects>;

      const resize = () => {
        canvas.width  = container.clientWidth;
        canvas.height = container.clientHeight;
        // Rebuild world offscreen canvas at new size
        worldRef.current  = buildWorldCanvas(canvas.width, canvas.height, worldData);
        trackCacheRef.current = null;
      };
      resize();

      window.addEventListener("resize", resize, { passive: true });
      animRef.current = requestAnimationFrame(draw);

      return () => {
        cancelAnimationFrame(animRef.current);
        window.removeEventListener("resize", resize);
      };
    };

    let cleanup: (() => void) | undefined;
    setup().then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Satellite selector dropdown */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          style={{
            background:     "rgba(13,27,46,0.92)",
            border:         "1px solid var(--border)",
            color:          SATRECORDS[selectedIdx].color,
            fontFamily:     "var(--font-geist-mono)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          className="text-sm px-4 py-2 rounded-lg outline-none cursor-pointer"
        >
          {SATRECORDS.map((s, i) => (
            <option key={s.name} value={i} style={{ background: "#0d1b2e", color: s.color }}>
              {s.name} — {s.type}
            </option>
          ))}
        </select>
      </div>

      {/* Live telemetry */}
      {info && (
        <div
          style={{
            background:     "rgba(13,27,46,0.88)",
            border:         `1px solid ${info.color}50`,
            backdropFilter: "blur(10px)",
          }}
          className="absolute bottom-4 right-4 px-4 py-3 rounded-xl text-xs font-mono space-y-1 min-w-[164px]"
        >
          <div style={{ color: info.color }} className="font-bold text-sm mb-2">{info.name}</div>
          {[
            ["Type",      info.type],
            ["Latitude",  `${info.lat}°`],
            ["Longitude", `${info.lon}°`],
            ["Altitude",  `${info.alt} km`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <span style={{ color: "var(--text)" }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)" }} className="pt-1 flex items-center gap-1.5">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: info.color }}
              className="inline-block animate-pulse" />
            <span style={{ color: "var(--muted)" }}>live · SGP4</span>
          </div>
        </div>
      )}

      {/* Track legend */}
      <div
        style={{ background: "rgba(13,27,46,0.88)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}
        className="absolute bottom-4 left-4 px-3 py-2 rounded-xl text-[10px] font-mono space-y-1"
      >
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 2, background: `${SATRECORDS[selectedIdx].color}35` }} />
          <span style={{ color: "var(--muted)" }}>past 90 min</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 2, background: `${SATRECORDS[selectedIdx].color}c0` }} />
          <span style={{ color: "var(--muted)" }}>next 90 min</span>
        </div>
      </div>
    </div>
  );
}
