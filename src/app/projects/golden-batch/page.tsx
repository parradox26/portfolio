"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

// Golden Batch: find optimal (temp, pressure, viscosity) for max yield
function yieldFn(temp: number, pressure: number, viscosity: number): number {
  // Multi-modal landscape with a global optimum
  const t = (temp - 180) / 50;
  const p = (pressure - 6) / 3;
  const v = (viscosity - 45) / 20;
  return (
    100 *
    Math.exp(-0.3 * (t * t + p * p + v * v)) *
    (1 + 0.2 * Math.sin(t * 4) * Math.cos(p * 3)) *
    (1 - 0.05 * Math.abs(v))
  );
}

interface Candidate { temp: number; pressure: number; viscosity: number; yield: number; step: number }

export default function GoldenBatchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ running: false, step: 0 });
  const [params, setParams] = useState({ temp: 180, pressure: 6, viscosity: 45 });
  const [best, setBest] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<Candidate[]>([]);
  const [running, setRunning] = useState(false);
  const [temp_sa, setTempSA] = useState(1.0); // simulated annealing temperature

  // Draw yield surface on canvas (temp vs pressure slice)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const img = ctx.createImageData(W, H);
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const t = 80 + (px / W) * 200;   // 80–280°C
        const p = 2 + (1 - py / H) * 10; // 2–12 bar
        const y = yieldFn(t, p, params.viscosity);
        const intensity = Math.max(0, Math.min(255, y * 2.55));
        const idx = (py * W + px) * 4;
        img.data[idx]     = Math.round(intensity * 0.05);
        img.data[idx + 1] = Math.round(intensity * 0.52);
        img.data[idx + 2] = Math.round(intensity * 0.8);
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Draw history
    history.slice(-50).forEach((c, i) => {
      const px = ((c.temp - 80) / 200) * W;
      const py = (1 - (c.pressure - 2) / 10) * H;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * (i / 50)})`;
      ctx.fill();
    });

    // Draw current position
    const cx = ((params.temp - 80) / 200) * W;
    const cy = (1 - (params.pressure - 2) / 10) * H;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#00d4ff";
    ctx.fill();

    // Draw best
    if (best) {
      const bx = ((best.temp - 80) / 200) * W;
      const by = (1 - (best.pressure - 2) / 10) * H;
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [params, history, best]);

  // Simulated annealing loop
  useEffect(() => {
    stateRef.current.running = running;
  }, [running]);

  useEffect(() => {
    if (!running) return;
    let step = 0;
    let current = { ...params };
    let currentYield = yieldFn(current.temp, current.pressure, current.viscosity);
    let bestLocal = { ...current, yield: currentYield, step: 0 };
    let sa_temp = 1.0;

    const tick = () => {
      if (!stateRef.current.running) return;
      // Neighbour
      const next = {
        temp: Math.max(80, Math.min(280, current.temp + (Math.random() - 0.5) * 20 * sa_temp)),
        pressure: Math.max(2, Math.min(12, current.pressure + (Math.random() - 0.5) * 2 * sa_temp)),
        viscosity: Math.max(10, Math.min(80, current.viscosity + (Math.random() - 0.5) * 10 * sa_temp)),
      };
      const nextYield = yieldFn(next.temp, next.pressure, next.viscosity);
      const delta = nextYield - currentYield;
      const accept = delta > 0 || Math.random() < Math.exp(delta / (sa_temp * 5 + 0.01));
      if (accept) {
        current = next;
        currentYield = nextYield;
        setParams({ temp: parseFloat(next.temp.toFixed(1)), pressure: parseFloat(next.pressure.toFixed(2)), viscosity: parseFloat(next.viscosity.toFixed(1)) });
      }
      if (currentYield > bestLocal.yield) {
        bestLocal = { ...current, yield: currentYield, step };
        setBest(bestLocal);
      }
      setHistory((h) => [...h.slice(-99), { ...current, yield: currentYield, step }]);
      sa_temp *= 0.995;
      setTempSA(parseFloat(sa_temp.toFixed(4)));
      step++;
      if (step < 500 && stateRef.current.running) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const currentYield = yieldFn(params.temp, params.pressure, params.viscosity);

  return (
    <>
      <Nav />
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">⚗️ Golden Batch Analytics</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">Simulated annealing · 3D parameter space · live yield surface</p>
          </div>
          <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas — yield surface */}
          <div className="lg:col-span-2">
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: "var(--text)" }} className="text-sm font-semibold">Yield Surface (Temp × Pressure)</span>
                <span style={{ color: "var(--muted)" }} className="text-xs font-mono">viscosity fixed at {params.viscosity}°</span>
              </div>
              <canvas ref={canvasRef} width={600} height={320} className="w-full rounded" />
              <div className="flex gap-4 mt-2 text-xs font-mono" style={{ color: "var(--muted)" }}>
                <span>X axis: Temperature (80–280 °C)</span>
                <span>Y axis: Pressure (2–12 bar)</span>
                <span style={{ color: "#00d4ff" }}>● current</span>
                <span style={{ color: "#f59e0b" }}>● best</span>
              </div>
            </div>
          </div>

          {/* Controls & stats */}
          <div className="space-y-4">
            {/* Current yield */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-4">
              <div style={{ color: "var(--muted)" }} className="text-xs font-mono mb-1">Current Yield</div>
              <div style={{ color: "var(--accent)" }} className="text-4xl font-bold font-mono">
                {currentYield.toFixed(1)}%
              </div>
              {best && (
                <div style={{ color: "var(--green)" }} className="text-xs font-mono mt-1">
                  Best: {best.yield.toFixed(1)}% (step {best.step})
                </div>
              )}
            </div>

            {/* Parameters */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-4 space-y-3">
              <div style={{ color: "var(--text)" }} className="text-sm font-semibold">Parameters</div>
              {[
                { label: "Temperature (°C)", key: "temp" as const, min: 80, max: 280 },
                { label: "Pressure (bar)", key: "pressure" as const, min: 2, max: 12, step: 0.1 },
                { label: "Viscosity (cP)", key: "viscosity" as const, min: 10, max: 80 },
              ].map((p) => (
                <div key={p.key}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span style={{ color: "var(--muted)" }}>{p.label}</span>
                    <span style={{ color: "var(--accent)" }}>{params[p.key]}</span>
                  </div>
                  <input
                    type="range" min={p.min} max={p.max} step={p.step ?? 1}
                    value={params[p.key]}
                    onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-400"
                    disabled={running}
                  />
                </div>
              ))}
            </div>

            {/* SA stats */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-4 text-xs font-mono">
              <div style={{ color: "var(--text)" }} className="font-semibold mb-2">Annealing Status</div>
              <div className="space-y-1" style={{ color: "var(--muted)" }}>
                <div>SA Temperature: <span style={{ color: "var(--amber)" }}>{temp_sa}</span></div>
                <div>Explored: <span style={{ color: "var(--accent)" }}>{history.length}</span> candidates</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!running) {
                  setHistory([]);
                  setBest(null);
                  setTempSA(1.0);
                }
                setRunning((r) => !r);
              }}
              style={{ background: running ? "var(--red)" : "var(--accent)", color: running ? "#fff" : "#050a14" }}
              className="w-full py-2.5 rounded-lg font-semibold text-sm"
            >
              {running ? "⏹ Stop Search" : "▶ Run Optimisation"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
