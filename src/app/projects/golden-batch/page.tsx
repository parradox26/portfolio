"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectMetrics from "@/components/projects/ProjectMetrics";
import ArchitectureDiagram from "@/components/projects/ArchitectureDiagram";
import DemoTransition from "@/components/projects/DemoTransition";
import ProjectNav from "@/components/projects/ProjectNav";
import { projectDetails, PROJECT_NAV_ORDER } from "@/lib/data/portfolio";

const detail = projectDetails["golden-batch"];
const navIdx = PROJECT_NAV_ORDER.findIndex((p) => p.slug === "golden-batch");
const prevProject = navIdx > 0 ? PROJECT_NAV_ORDER[navIdx - 1] : undefined;
const nextProject = navIdx < PROJECT_NAV_ORDER.length - 1 ? PROJECT_NAV_ORDER[navIdx + 1] : undefined;

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
      <ProjectHero
        name={detail.name}
        icon={detail.icon}
        tagline={detail.tagline}
        year={detail.year}
        role={detail.role}
        techStack={detail.techStack}
        metricsSummary={detail.metrics.map((m) => ({ label: m.label, value: m.value }))}
        demoLabel="Live Optimiser"
      />
      <ProjectOverview paragraphs={detail.overview} />
      <ProjectMetrics metrics={detail.metrics} />
      <ArchitectureDiagram nodes={detail.architecture.nodes} edges={detail.architecture.edges} />      
      <ProjectNav
        prev={prevProject ? { name: prevProject.name, href: prevProject.href, icon: prevProject.icon } : undefined}
        next={nextProject ? { name: nextProject.name, href: nextProject.href, icon: nextProject.icon } : undefined}
      />
    </>
  );
}
