"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectMetrics from "@/components/projects/ProjectMetrics";
import ArchitectureDiagram from "@/components/projects/ArchitectureDiagram";
import DemoTransition from "@/components/projects/DemoTransition";
import ProjectNav from "@/components/projects/ProjectNav";
import { projectDetails, PROJECT_NAV_ORDER } from "@/lib/data/portfolio";

const detail = projectDetails["city-iot"];
const navIdx = PROJECT_NAV_ORDER.findIndex((p) => p.slug === "city-iot");
const prevProject = navIdx > 0 ? PROJECT_NAV_ORDER[navIdx - 1] : undefined;
const nextProject = navIdx < PROJECT_NAV_ORDER.length - 1 ? PROJECT_NAV_ORDER[navIdx + 1] : undefined;

type DeviceType = "air" | "traffic" | "energy" | "cctv" | "noise";

interface Device {
  id: number;
  type: DeviceType;
  lat: number;
  lon: number;
  value: number;
  unit: string;
  status: "ok" | "warn" | "alert";
  label: string;
}

const TYPE_META: Record<DeviceType, { icon: string; unit: string; min: number; max: number; warnAt: number; alertAt: number; color: string }> = {
  air:     { icon: "💨", unit: "AQI",   min: 10,  max: 200,  warnAt: 100, alertAt: 150, color: "#06b6d4" },
  traffic: { icon: "🚗", unit: "veh/h", min: 50,  max: 1200, warnAt: 900, alertAt: 1100, color: "#f59e0b" },
  energy:  { icon: "⚡", unit: "kW",    min: 5,   max: 500,  warnAt: 400, alertAt: 470,  color: "#a78bfa" },
  cctv:    { icon: "📹", unit: "fps",   min: 24,  max: 30,   warnAt: 26,  alertAt: 24,   color: "#10b981" },
  noise:   { icon: "🔊", unit: "dB",    min: 30,  max: 90,   warnAt: 70,  alertAt: 80,   color: "#ef4444" },
};

const CENTER = { lat: 51.505, lon: -0.09 };
const LAT_RANGE = 0.12;
const LON_RANGE = 0.18;
const TILE_ZOOM = 14;

// ── OSM tile helpers (Web Mercator) ─────────────────────────────
function latLonToTile(lat: number, lon: number, z: number) {
  const n = Math.pow(2, z);
  const tx = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const ty = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { tx, ty };
}

function tileTopLeft(tx: number, ty: number, z: number) {
  const n = Math.pow(2, z);
  const lon = (tx / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n)));
  return { lat: (latRad * 180) / Math.PI, lon };
}

function generateDevices(count: number): Device[] {
  const types: DeviceType[] = ["air", "traffic", "energy", "cctv", "noise"];
  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const meta = TYPE_META[type];
    const value = meta.min + Math.random() * (meta.max - meta.min);
    const status = value >= meta.alertAt ? "alert" : value >= meta.warnAt ? "warn" : "ok";
    return {
      id: i,
      type,
      lat: CENTER.lat + (Math.random() - 0.5) * LAT_RANGE * 0.9,
      lon: CENTER.lon + (Math.random() - 0.5) * LON_RANGE * 0.9,
      value: parseFloat(value.toFixed(1)),
      unit: meta.unit,
      status,
      label: `${type.toUpperCase()}-${String(i).padStart(3, "0")}`,
    };
  });
}

const STATUS_COLORS = { ok: "#10b981", warn: "#f59e0b", alert: "#ef4444" };

export default function CityIoTPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number>(0);
  const tileImgRef  = useRef<Map<string, HTMLImageElement>>(new Map());

  const [devices,    setDevices]    = useState<Device[]>([]);
  const [selected,   setSelected]   = useState<Device | null>(null);
  const [filter,     setFilter]     = useState<DeviceType | "all">("all");
  const [tilesTick,  setTilesTick]  = useState(0);

  useEffect(() => { setDevices(generateDevices(200)); }, []);

  // Load OSM tiles covering the viewport once
  useEffect(() => {
    const minLat = CENTER.lat - LAT_RANGE / 2;
    const maxLat = CENTER.lat + LAT_RANGE / 2;
    const minLon = CENTER.lon - LON_RANGE / 2;
    const maxLon = CENTER.lon + LON_RANGE / 2;
    const { tx: txMin, ty: tyMin } = latLonToTile(maxLat, minLon, TILE_ZOOM);
    const { tx: txMax, ty: tyMax } = latLonToTile(minLat, maxLon, TILE_ZOOM);
    for (let tx = txMin; tx <= txMax; tx++) {
      for (let ty = tyMin; ty <= tyMax; ty++) {
        const key = `${tx},${ty}`;
        if (tileImgRef.current.has(key)) continue;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => setTilesTick((n) => n + 1);
        img.src = `https://tile.openstreetmap.org/${TILE_ZOOM}/${tx}/${ty}.png`;
        tileImgRef.current.set(key, img);
      }
    }
  }, []);

  // Drift device values
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => {
          const meta = TYPE_META[d.type];
          const delta = (Math.random() - 0.5) * (meta.max - meta.min) * 0.05;
          const value = Math.max(meta.min, Math.min(meta.max, d.value + delta));
          const status = value >= meta.alertAt ? "alert" : value >= meta.warnAt ? "warn" : "ok";
          return { ...d, value: parseFloat(value.toFixed(1)), status };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const latToY = useCallback((lat: number, H: number) =>
    H - ((lat - (CENTER.lat - LAT_RANGE / 2)) / LAT_RANGE) * H, []);

  const lonToX = useCallback((lon: number, W: number) =>
    ((lon - (CENTER.lon - LON_RANGE / 2)) / LON_RANGE) * W, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || devices.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── Background fallback ──────────────────────────────────────
      ctx.fillStyle = "#0d1b2e";
      ctx.fillRect(0, 0, W, H);

      // ── OSM tiles ────────────────────────────────────────────────
      const minLat = CENTER.lat - LAT_RANGE / 2;
      const maxLat = CENTER.lat + LAT_RANGE / 2;
      const minLon = CENTER.lon - LON_RANGE / 2;
      const maxLon = CENTER.lon + LON_RANGE / 2;
      const { tx: txMin, ty: tyMin } = latLonToTile(maxLat, minLon, TILE_ZOOM);
      const { tx: txMax, ty: tyMax } = latLonToTile(minLat, maxLon, TILE_ZOOM);

      for (let tx = txMin; tx <= txMax; tx++) {
        for (let ty = tyMin; ty <= tyMax; ty++) {
          const img = tileImgRef.current.get(`${tx},${ty}`);
          if (!img?.complete || !img.naturalWidth) continue;
          const tl = tileTopLeft(tx, ty, TILE_ZOOM);
          const br = tileTopLeft(tx + 1, ty + 1, TILE_ZOOM);
          const dx = lonToX(tl.lon, W);
          const dy = latToY(tl.lat, H);
          const dw = lonToX(br.lon, W) - dx;
          const dh = latToY(br.lat, H) - dy;
          try { ctx.drawImage(img, dx, dy, dw, dh); } catch { /**/ }
        }
      }

      // ── Dark overlay so sensor dots stay readable ────────────────
      ctx.fillStyle = "rgba(2,10,26,0.52)";
      ctx.fillRect(0, 0, W, H);

      // ── Subtle grid ──────────────────────────────────────────────
      ctx.strokeStyle = "rgba(30,58,95,0.25)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── Devices ──────────────────────────────────────────────────
      const visible = filter === "all" ? devices : devices.filter((d) => d.type === filter);
      visible.forEach((d) => {
        const x = lonToX(d.lon, W);
        const y = latToY(d.lat, H);
        const color = STATUS_COLORS[d.status];

        if (d.status === "alert") {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fillStyle = `${color}22`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, d.status === "alert" ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = d.status === "alert" ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (selected?.id === d.id) {
          ctx.beginPath();
          ctx.arc(x, y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    draw();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [devices, filter, selected, latToY, lonToX, tilesTick]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const my = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const visible = filter === "all" ? devices : devices.filter((d) => d.type === filter);
    const hit = visible.find((d) => {
      const x = lonToX(d.lon, canvas.width);
      const y = latToY(d.lat, canvas.height);
      return Math.hypot(x - mx, y - my) < 12;
    });
    setSelected(hit || null);
  };

  const counts = { ok: 0, warn: 0, alert: 0 };
  devices.forEach((d) => counts[d.status]++);

  return (
    <>
      <Nav />
      <ProjectHero
        name={detail.name}
        icon={detail.icon}
        tagline={detail.tagline}
        year={detail.year}
        role={detail.role}
        techStack={detail.techStack}
        metricsSummary={detail.metrics.map((m) => ({ label: m.label, value: m.value }))}
        demoLabel="Live Sensor Map"
      />
      <ProjectOverview paragraphs={detail.overview} />
      <ProjectMetrics metrics={detail.metrics} />
      <ArchitectureDiagram nodes={detail.architecture.nodes} edges={detail.architecture.edges} />
      <DemoTransition label="Live IoT Sensor Map" />
      <div style={{ background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h2 style={{ color: "var(--text)" }} className="font-bold text-base">🏙️ Smart City Management Platform</h2>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">200 simulated sensors · live readings · click to inspect</p>
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(counts).map(([s, n]) => (
              <span key={s} style={{ color: STATUS_COLORS[s as keyof typeof STATUS_COLORS] }} className="text-xs font-mono">
                {s}: {n}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "air", "traffic", "energy", "cctv", "noise"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  background: filter === t ? "var(--accent)" : "var(--surface)",
                  color: filter === t ? "#050a14" : "var(--muted)",
                  border: "1px solid var(--border)",
                }}
                className="text-xs font-mono px-3 py-1 rounded-full"
              >
                {t === "all" ? "All Devices" : `${TYPE_META[t].icon} ${t}`}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            {/* Canvas map */}
            <div className="flex-1 relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={480}
                className="w-full"
                onClick={handleCanvasClick}
                style={{ cursor: "crosshair" }}
              />
              {/* Map attribution */}
              <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                © OpenStreetMap contributors
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-56 flex flex-col gap-3">
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-3 text-xs font-mono">
                <div style={{ color: "var(--text)" }} className="font-semibold mb-2">Device Types</div>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 mb-1">
                    <div style={{ background: v.color, width: 8, height: 8, borderRadius: "50%" }} />
                    <span style={{ color: "var(--muted)" }}>{v.icon} {k}</span>
                  </div>
                ))}
              </div>

              {selected ? (
                <div
                  style={{ background: "var(--surface)", border: `1px solid ${STATUS_COLORS[selected.status]}` }}
                  className="rounded-xl p-3 text-xs font-mono">
                  <div style={{ color: STATUS_COLORS[selected.status] }} className="font-bold text-sm mb-2">
                    {TYPE_META[selected.type].icon} {selected.label}
                  </div>
                  <div style={{ color: "var(--muted)" }} className="space-y-1">
                    <div><span style={{ color: "var(--text)" }}>Value:</span> {selected.value} {selected.unit}</div>
                    <div><span style={{ color: "var(--text)" }}>Status:</span> {selected.status.toUpperCase()}</div>
                    <div><span style={{ color: "var(--text)" }}>Lat:</span> {selected.lat.toFixed(4)}</div>
                    <div><span style={{ color: "var(--text)" }}>Lon:</span> {selected.lon.toFixed(4)}</div>
                  </div>
                </div>
              ) : (
                <div style={{ border: "1px dashed var(--border)" }} className="rounded-xl p-3 text-xs text-center">
                  <p style={{ color: "var(--muted)" }}>Click a dot to inspect device</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProjectNav
        prev={prevProject ? { name: prevProject.name, href: prevProject.href, icon: prevProject.icon } : undefined}
        next={nextProject ? { name: nextProject.name, href: nextProject.href, icon: nextProject.icon } : undefined}
      />
    </>
  );
}
