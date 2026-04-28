"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as satellite from "satellite.js";
import { feature, mesh } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import { TLES } from "@/lib/data/tles";

const SATRECORDS = TLES.map((tle) => ({
  ...tle,
  satrec: satellite.twoline2satrec(tle.line1, tle.line2),
}));

// ── Projection helpers ──────────────────────────────────────────
const lonToX = (lon: number, W: number) => ((lon + 180) / 360) * W;
const latToY = (lat: number, H: number) => ((90 - lat) / 180) * H;
const xToLon = (x: number, W: number) => (x / W) * 360 - 180;
const yToLat = (y: number, H: number) => 90 - (y / H) * 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function geoPath(ctx: CanvasRenderingContext2D, geom: any, W: number, H: number) {
  if (!geom) return;
  const type: string = geom.type;
  let ringGroups: number[][][] = [];
  if (type === "Polygon")             ringGroups = geom.coordinates;
  else if (type === "MultiPolygon")   geom.coordinates.forEach((p: number[][][]) => p.forEach((r) => ringGroups.push(r)));
  else if (type === "LineString")     ringGroups = [geom.coordinates];
  else if (type === "MultiLineString") ringGroups = geom.coordinates;
  else if (type === "GeometryCollection")
    geom.geometries.forEach((g: unknown) => geoPath(ctx, g, W, H));

  for (const ring of ringGroups) {
    let prevLon: number | null = null;
    let first = true;
    for (const coord of ring) {
      const lon = coord[0], lat = coord[1];
      if (prevLon !== null && Math.abs(lon - prevLon) > 180) first = true;
      const x = lonToX(lon, W), y = latToY(lat, H);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      prevLon = lon;
    }
  }
}

function buildWorldCanvas(W: number, H: number, topology: Topology<Objects>): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const ctx = off.getContext("2d")!;

  ctx.fillStyle = "#050a14";
  ctx.fillRect(0, 0, W, H);

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

  ctx.strokeStyle = "rgba(0,212,255,0.15)";
  ctx.lineWidth = 0.8;
  const eqY = latToY(0, H);
  ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke();

  ctx.strokeStyle = "rgba(30,58,95,0.55)";
  ctx.lineWidth = 0.4;
  ctx.setLineDash([4, 5]);
  [23.5, -23.5].forEach((lat) => {
    const y = latToY(lat, H);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });
  ctx.setLineDash([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landFeature = feature(topology, (topology.objects as any).land);
  ctx.beginPath();
  if ((landFeature as { type: string }).type === "Feature") {
    geoPath(ctx, (landFeature as { geometry: unknown }).geometry, W, H);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (landFeature as any).features?.forEach((f: { geometry: unknown }) =>
      geoPath(ctx, f.geometry, W, H)
    );
  }
  ctx.fillStyle = "rgba(18,44,70,0.75)";
  ctx.fill();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const borders = mesh(topology, (topology.objects as any).countries, (a: unknown, b: unknown) => a !== b);
  ctx.beginPath();
  geoPath(ctx, borders, W, H);
  ctx.strokeStyle = "rgba(0,212,255,0.18)";
  ctx.lineWidth = 0.4;
  ctx.stroke();

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

// ── Track computation ───────────────────────────────────────────
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

// ── AOI / next-pass helpers ─────────────────────────────────────
interface Aoi { lat1: number; lon1: number; lat2: number; lon2: number }

function computeNextPass(
  satrec: ReturnType<typeof satellite.twoline2satrec>,
  aoi: Aoi,
  now: Date
): number | null {
  const minLat = Math.min(aoi.lat1, aoi.lat2);
  const maxLat = Math.max(aoi.lat1, aoi.lat2);
  const minLon = Math.min(aoi.lon1, aoi.lon2);
  const maxLon = Math.max(aoi.lon1, aoi.lon2);
  for (let m = 1; m <= 24 * 60; m++) {
    const t = new Date(now.getTime() + m * 60_000);
    try {
      const pv = satellite.propagate(satrec, t);
      if (!pv || typeof pv.position === "boolean" || !pv.position) continue;
      const gmst = satellite.gstime(t);
      const gd   = satellite.eciToGeodetic(pv.position, gmst);
      const lat  = satellite.degreesLat(gd.latitude);
      const lon  = satellite.degreesLong(gd.longitude);
      if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) return m;
    } catch { /**/ }
  }
  return null;
}

function fmtMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── Component ───────────────────────────────────────────────────
export default function SatelliteTracker2D() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const animRef       = useRef<number>(0);
  const worldRef      = useRef<HTMLCanvasElement | null>(null);
  const trackCacheRef = useRef<{ ts: number; pts: TrackPoint[] } | null>(null);
  const selectedRef   = useRef(0);

  // AOI drawing refs (used inside stable rAF closure)
  const drawModeRef   = useRef(false);
  const aoiRef        = useRef<Aoi | null>(null);
  const dragStartRef  = useRef<{ x: number; y: number } | null>(null);
  const dragCurRef    = useRef<{ x: number; y: number } | null>(null);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [info, setInfo] = useState<{
    lat: number; lon: number; alt: number; name: string; type: string; color: string;
  } | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [aoi, setAoi] = useState<(Aoi & { nextPassMin: number | null }) | null>(null);

  useEffect(() => {
    selectedRef.current = selectedIdx;
    trackCacheRef.current = null;
  }, [selectedIdx]);

  // Keep drawMode ref in sync
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !worldRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const now = new Date();
    const rec = SATRECORDS[selectedRef.current];

    ctx.drawImage(worldRef.current, 0, 0);

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

    // ── AOI (finalized) ──────────────────────────────────────────
    const currentAoi = aoiRef.current;
    if (currentAoi) {
      const ax1 = lonToX(currentAoi.lon1, W), ay1 = latToY(currentAoi.lat1, H);
      const ax2 = lonToX(currentAoi.lon2, W), ay2 = latToY(currentAoi.lat2, H);
      const rx = Math.min(ax1, ax2), ry = Math.min(ay1, ay2);
      const rw = Math.abs(ax2 - ax1),  rh = Math.abs(ay2 - ay1);
      ctx.fillStyle   = "rgba(0,212,255,0.07)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
      ctx.font      = "bold 10px monospace";
      ctx.fillStyle = "#00d4ff";
      ctx.fillText("AOI", rx + 4, ry + 12);
    }

    // ── Live drag rectangle ──────────────────────────────────────
    const ds = dragStartRef.current, dc = dragCurRef.current;
    if (ds && dc) {
      const rx = Math.min(ds.x, dc.x), ry = Math.min(ds.y, dc.y);
      const rw = Math.abs(dc.x - ds.x),  rh = Math.abs(dc.y - ds.y);
      ctx.fillStyle   = "rgba(0,212,255,0.05)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = "rgba(0,212,255,0.65)";
      ctx.lineWidth   = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
    }

    // ── Current satellite position ───────────────────────────────
    try {
      const pv = satellite.propagate(rec.satrec, now);
      if (pv && typeof pv.position !== "boolean" && pv.position) {
        const gmst = satellite.gstime(now);
        const gd   = satellite.eciToGeodetic(pv.position, gmst);
        const lat  = satellite.degreesLat(gd.latitude);
        const lon  = satellite.degreesLong(gd.longitude);
        const cx   = lonToX(lon, W), cy = latToY(lat, H);

        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth   = 0.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(cx, 0);  ctx.lineTo(cx, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy);  ctx.lineTo(W, cy); ctx.stroke();
        ctx.setLineDash([]);

        const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 18);
        grad.addColorStop(0, `${color}70`);
        grad.addColorStop(1, `${color}00`);
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

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
  }, []);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setup = async () => {
      const worldData = (await import("world-atlas/countries-110m.json")) as unknown as Topology<Objects>;

      const resize = () => {
        canvas.width  = container.clientWidth;
        canvas.height = container.clientHeight;
        worldRef.current      = buildWorldCanvas(canvas.width, canvas.height, worldData);
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

  // ── Canvas mouse handlers for AOI drawing ───────────────────
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * canvas.width,
      y: ((e.clientY - rect.top)  / rect.height) * canvas.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawModeRef.current) return;
    const pos = getCanvasPos(e);
    dragStartRef.current = pos;
    dragCurRef.current   = pos;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStartRef.current) return;
    dragCurRef.current = getCanvasPos(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStartRef.current || !drawModeRef.current) return;
    const end = getCanvasPos(e);
    const canvas = canvasRef.current!;
    const W = canvas.width, H = canvas.height;
    const start = dragStartRef.current;

    const newAoi: Aoi = {
      lat1: yToLat(start.y, H), lon1: xToLon(start.x, W),
      lat2: yToLat(end.y,   H), lon2: xToLon(end.x,   W),
    };
    aoiRef.current    = newAoi;
    dragStartRef.current = null;
    dragCurRef.current   = null;

    const passMin = computeNextPass(SATRECORDS[selectedRef.current].satrec, newAoi, new Date());
    setAoi({ ...newAoi, nextPassMin: passMin });
    setDrawMode(false);
  };

  const clearAoi = () => {
    aoiRef.current = null;
    setAoi(null);
  };

  // Recompute next pass when satellite changes (if AOI exists)
  useEffect(() => {
    if (!aoiRef.current) return;
    const passMin = computeNextPass(SATRECORDS[selectedIdx].satrec, aoiRef.current, new Date());
    setAoi((prev) => prev ? { ...prev, nextPassMin: passMin } : null);
  }, [selectedIdx]);

  const aoiBounds = aoi ? {
    minLat: Math.min(aoi.lat1, aoi.lat2).toFixed(1),
    maxLat: Math.max(aoi.lat1, aoi.lat2).toFixed(1),
    minLon: Math.min(aoi.lon1, aoi.lon2).toFixed(1),
    maxLon: Math.max(aoi.lon1, aoi.lon2).toFixed(1),
  } : null;

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: drawMode ? "crosshair" : "default" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Satellite selector + AOI button row */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
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

        <button
          onClick={() => {
            if (aoi) { clearAoi(); return; }
            setDrawMode((m) => !m);
          }}
          style={{
            background:     drawMode ? "rgba(0,212,255,0.18)" : "rgba(13,27,46,0.92)",
            border:         drawMode ? "1px solid #00d4ff" : "1px solid var(--border)",
            color:          drawMode ? "#00d4ff" : "var(--muted)",
            fontFamily:     "var(--font-geist-mono)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          className="text-xs px-3 py-2 rounded-lg whitespace-nowrap"
        >
          {aoi ? "✕ Clear AOI" : drawMode ? "Drawing…" : "Draw AOI"}
        </button>
      </div>

      {/* AOI info panel */}
      {aoi && aoiBounds && (
        <div
          style={{
            background:     "rgba(13,27,46,0.92)",
            border:         "1px solid #00d4ff60",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          className="absolute top-14 right-4 px-4 py-3 rounded-xl text-xs font-mono space-y-1.5 min-w-[200px]"
        >
          <div style={{ color: "#00d4ff" }} className="font-bold text-sm mb-2">Area of Interest</div>
          {[
            ["Lat",  `${aoiBounds.minLat}° – ${aoiBounds.maxLat}°`],
            ["Lon",  `${aoiBounds.minLon}° – ${aoiBounds.maxLon}°`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <span style={{ color: "var(--text)" }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)" }} className="pt-1.5">
            <div className="flex justify-between gap-4">
              <span style={{ color: "var(--muted)" }}>Next pass</span>
              <span style={{ color: aoi.nextPassMin ? "#00d4ff" : "#ef4444", fontWeight: 600 }}>
                {aoi.nextPassMin ? `in ${fmtMinutes(aoi.nextPassMin)}` : "none in 24 h"}
              </span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 9, marginTop: 4 }}>
              mocked · SGP4 propagation
            </div>
          </div>
        </div>
      )}

      {/* Draw-mode hint */}
      {drawMode && (
        <div
          style={{
            background:     "rgba(0,212,255,0.12)",
            border:         "1px solid #00d4ff50",
            backdropFilter: "blur(8px)",
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-mono"
        >
          <span style={{ color: "#00d4ff" }}>Click and drag to select an area</span>
        </div>
      )}

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
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 2, background: "#00d4ff", borderStyle: "dashed" }} />
          <span style={{ color: "var(--muted)" }}>AOI boundary</span>
        </div>
      </div>
    </div>
  );
}
