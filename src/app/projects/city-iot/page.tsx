"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

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
  air:     { icon: "💨", unit: "AQI",  min: 10,  max: 200, warnAt: 100, alertAt: 150, color: "#06b6d4" },
  traffic: { icon: "🚗", unit: "veh/h", min: 50, max: 1200, warnAt: 900, alertAt: 1100, color: "#f59e0b" },
  energy:  { icon: "⚡", unit: "kW",   min: 5,   max: 500, warnAt: 400, alertAt: 470,  color: "#a78bfa" },
  cctv:    { icon: "📹", unit: "fps",  min: 24,  max: 30,  warnAt: 26,  alertAt: 24,   color: "#10b981" },
  noise:   { icon: "🔊", unit: "dB",   min: 30,  max: 90,  warnAt: 70,  alertAt: 80,   color: "#ef4444" },
};

// City center: London
const CENTER = { lat: 51.505, lon: -0.09 };

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
      lat: CENTER.lat + (Math.random() - 0.5) * 0.1,
      lon: CENTER.lon + (Math.random() - 0.5) * 0.15,
      value: parseFloat(value.toFixed(1)),
      unit: meta.unit,
      status,
      label: `${type.toUpperCase()}-${String(i).padStart(3, "0")}`,
    };
  });
}

const STATUS_COLORS = { ok: "#10b981", warn: "#f59e0b", alert: "#ef4444" };

export default function CityIoTPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState<Device | null>(null);
  const [filter, setFilter] = useState<DeviceType | "all">("all");
  const [viewport, setViewport] = useState({ zoom: 1, x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    setDevices(generateDevices(200));
  }, []);

  // Update values
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

  const latToY = useCallback((lat: number, H: number) => {
    const range = 0.12;
    return H - ((lat - (CENTER.lat - range / 2)) / range) * H;
  }, []);

  const lonToX = useCallback((lon: number, W: number) => {
    const range = 0.18;
    return ((lon - (CENTER.lon - range / 2)) / range) * W;
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || devices.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.fillStyle = "#0d1b2e";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Devices
      const visible = filter === "all" ? devices : devices.filter((d) => d.type === filter);
      visible.forEach((d) => {
        const x = lonToX(d.lon, W);
        const y = latToY(d.lat, H);
        const color = STATUS_COLORS[d.status];

        // Pulse for alert
        if (d.status === "alert") {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fillStyle = `${color}22`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, d.status === "alert" ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (selected?.id === d.id) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };
    draw();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [devices, filter, selected, latToY, lonToX]);

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
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">🏙️ Smart City Management Platform</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">200 simulated sensors · live readings · click to inspect</p>
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(counts).map(([s, n]) => (
              <span key={s} style={{ color: STATUS_COLORS[s as keyof typeof STATUS_COLORS] }} className="text-xs font-mono">
                {s}: {n}
              </span>
            ))}
            <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
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
            </div>

            {/* Sidebar */}
            <div className="w-56 flex flex-col gap-3">
              {/* Legend */}
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

              {/* Selected device */}
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
                <div style={{ border: "1px dashed var(--border)" }} className="rounded-xl p-3 text-xs text-center" >
                  <p style={{ color: "var(--muted)" }}>Click a dot to inspect device</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
