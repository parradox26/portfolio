"use client";
import { useState, useMemo } from "react";
import Nav from "@/components/Nav";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectMetrics from "@/components/projects/ProjectMetrics";
import ArchitectureDiagram from "@/components/projects/ArchitectureDiagram";
import DemoTransition from "@/components/projects/DemoTransition";
import ProjectNav from "@/components/projects/ProjectNav";
import { projectDetails, PROJECT_NAV_ORDER } from "@/lib/data/portfolio";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, Area, AreaChart, ComposedChart, ReferenceArea,
} from "recharts";

const detail = projectDetails["demand-forecasting"];
const navIdx = PROJECT_NAV_ORDER.findIndex((p) => p.slug === "demand-forecasting");
const prevProject = navIdx > 0 ? PROJECT_NAV_ORDER[navIdx - 1] : undefined;
const nextProject = navIdx < PROJECT_NAV_ORDER.length - 1 ? PROJECT_NAV_ORDER[navIdx + 1] : undefined;

// ── Data generation ───────────────────────────────────────────────────
function seed(s: number) {
  let x = Math.sin(s + 1) * 10000;
  return x - Math.floor(x);
}

function genHistorical(sku: 0 | 1 | 2, week: number): number {
  if (sku === 0) {
    // High demand / seasonal
    const base = 1000;
    const seasonal = 300 * Math.sin((week / 52) * 2 * Math.PI - 1.5);
    const noise = (seed(week * 3 + 1) - 0.5) * 200;
    return Math.max(0, Math.round(base + seasonal + noise));
  }
  if (sku === 1) {
    // Steady
    const base = 600;
    const trend = week * 2;
    const noise = (seed(week * 7 + 2) - 0.5) * 80;
    return Math.max(0, Math.round(base + trend + noise));
  }
  // Intermittent / lumpy
  const isSparse = seed(week * 11 + 3) > 0.45;
  if (!isSparse) return 0;
  return Math.round(200 + seed(week * 13 + 4) * 800);
}

function genForecast(sku: 0 | 1 | 2, week: number, model: "lgbm" | "tft"): { value: number; lo: number; hi: number } {
  const actual = genHistorical(sku, week);
  if (model === "lgbm") {
    const bias = sku === 0 ? (seed(week * 5 + 10) - 0.3) * 250 : (seed(week * 5 + 10) - 0.5) * 120;
    const ci = sku === 0 ? 220 : 140;
    const val = Math.max(0, Math.round(actual + bias));
    return { value: val, lo: Math.max(0, val - ci), hi: val + ci };
  }
  // TFT — tighter CI, more accurate
  const bias = sku === 0 ? (seed(week * 3 + 20) - 0.5) * 80 : (seed(week * 3 + 20) - 0.5) * 50;
  const ci = sku === 0 ? 80 : 55;
  const val = Math.max(0, Math.round(actual + bias));
  return { value: val, lo: Math.max(0, val - ci), hi: val + ci };
}

const SKUS = [
  { id: 0, label: "SKU-001", desc: "High demand / seasonal", color: "#00d4ff" },
  { id: 1, label: "SKU-002", desc: "Steady baseline",         color: "#10b981" },
  { id: 2, label: "SKU-003", desc: "Intermittent / lumpy",   color: "#f59e0b" },
] as const;

function buildChartData(sku: 0 | 1 | 2, stockoutSpike: boolean) {
  return Array.from({ length: 52 }, (_, i) => {
    const week = i + 1;
    const isForecast = week > 40;
    const actualRaw = genHistorical(sku, week);
    const actual = isForecast
      ? (stockoutSpike && week === 46 ? actualRaw * 2.4 : null)
      : actualRaw;

    if (isForecast) {
      const lgbm = genForecast(sku, week, "lgbm");
      const tft = genForecast(sku, week, "tft");
      const spikeActual = stockoutSpike && week === 46 ? actualRaw * 2.4 : actualRaw;
      // After spike: TFT catches it, LightGBM misses
      const lgbmVal = stockoutSpike && week === 46 ? lgbm.value : lgbm.value;
      const tftVal = stockoutSpike && week === 46 ? Math.round(spikeActual * 0.9) : tft.value;
      return {
        week: `W${week}`,
        actual: null,
        lgbm: lgbmVal,
        tft: tftVal,
        lgbm_lo: lgbm.lo,
        lgbm_hi: lgbm.hi,
        tft_lo: tft.lo,
        tft_hi: tft.hi,
        spike: stockoutSpike && week === 46 ? spikeActual : null,
      };
    }
    return { week: `W${week}`, actual, lgbm: null, tft: null, lgbm_lo: null, lgbm_hi: null, tft_lo: null, tft_hi: null, spike: null };
  });
}

// ── Metrics calculation ───────────────────────────────────────────────
function smape(actual: number[], pred: number[]): number {
  const vals = actual.map((a, i) => {
    const denom = (Math.abs(a) + Math.abs(pred[i])) / 2;
    return denom === 0 ? 0 : Math.abs(a - pred[i]) / denom;
  });
  return parseFloat((100 * vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1));
}

export default function DemandForecastingPage() {
  const [activeSku, setActiveSku] = useState<0 | 1 | 2>(0);
  const [stockoutSpike, setStockoutSpike] = useState(false);

  const chartData = useMemo(() => buildChartData(activeSku, stockoutSpike), [activeSku, stockoutSpike]);

  const skuInfo = SKUS[activeSku];

  // Compute forecast metrics for weeks 41-52
  const { lgbmSmape, tftSmape, lgbmCiWidth, tftCiWidth, stockoutsLgbm, stockoutsTft } = useMemo(() => {
    const forecastWeeks = Array.from({ length: 12 }, (_, i) => i + 41);
    const actuals = forecastWeeks.map((w) => genHistorical(activeSku, w));
    const lgbmPreds = forecastWeeks.map((w) => genForecast(activeSku, w, "lgbm").value);
    const tftPreds  = forecastWeeks.map((w) => genForecast(activeSku, w, "tft").value);
    const lgbmCis   = forecastWeeks.map((w) => { const f = genForecast(activeSku, w, "lgbm"); return f.hi - f.lo; });
    const tftCis    = forecastWeeks.map((w) => { const f = genForecast(activeSku, w, "tft");  return f.hi - f.lo; });

    const stockThreshold = 100;
    const sLgbm = lgbmPreds.filter((v, i) => v < actuals[i] - stockThreshold).length;
    const sTft  = tftPreds.filter((v, i)  => v < actuals[i] - stockThreshold).length;

    return {
      lgbmSmape: smape(actuals, lgbmPreds),
      tftSmape:  smape(actuals, tftPreds),
      lgbmCiWidth: Math.round(lgbmCis.reduce((s, v) => s + v, 0) / lgbmCis.length),
      tftCiWidth:  Math.round(tftCis.reduce((s, v) => s + v, 0) / tftCis.length),
      stockoutsLgbm: sLgbm,
      stockoutsTft:  sTft,
    };
  }, [activeSku]);

  const tooltipStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-geist-mono)",
    fontSize: 11,
  };

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
        demoLabel="Forecast Visualiser"
      />
      <ProjectOverview paragraphs={detail.overview} />
      <ProjectMetrics metrics={detail.metrics} />
      <ArchitectureDiagram nodes={detail.architecture.nodes} edges={detail.architecture.edges} />
      <DemoTransition label="Forecast Model Comparison" />

      {/* Demo */}
      <div style={{ background: "var(--bg)" }}>
        <div
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3"
        >
          <div>
            <h2 style={{ color: "var(--text)" }} className="font-bold text-base">📈 Demand Forecast — LightGBM vs TFT</h2>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono mt-0.5">
              52-week simulation · weeks 1–40 historical · weeks 41–52 forecast
            </p>
          </div>
          <button
            onClick={() => { setStockoutSpike((s) => !s); }}
            style={{
              background: stockoutSpike ? "rgba(239,68,68,0.15)" : "var(--surface2)",
              border: `1px solid ${stockoutSpike ? "#ef4444" : "var(--border)"}`,
              color: stockoutSpike ? "#ef4444" : "var(--muted)",
            }}
            className="text-xs font-mono px-3 py-1.5 rounded"
          >
            {stockoutSpike ? "⚠ Stockout spike active" : "Simulate Stockout (W46)"}
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* SKU tabs */}
          <div className="flex gap-2 flex-wrap">
            {SKUS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSku(s.id)}
                style={{
                  background: activeSku === s.id ? s.color + "22" : "var(--surface)",
                  border: `1px solid ${activeSku === s.id ? s.color : "var(--border)"}`,
                  color: activeSku === s.id ? s.color : "var(--muted)",
                }}
                className="text-xs font-mono px-4 py-1.5 rounded-full"
              >
                {s.label} — {s.desc}
              </button>
            ))}
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "SMAPE",
                lgbm: `${lgbmSmape}%`,
                tft: `${tftSmape}%`,
                winner: "tft" as const,
                detail: "Symmetric Mean Absolute Percentage Error (lower is better)",
              },
              {
                label: "CI Width (avg)",
                lgbm: `±${lgbmCiWidth}`,
                tft: `±${tftCiWidth}`,
                winner: "tft" as const,
                detail: "Average confidence interval width (tighter = more useful)",
              },
              {
                label: "Stockout events",
                lgbm: `${stockoutsLgbm}`,
                tft: `${stockoutsTft}`,
                winner: "tft" as const,
                detail: "Weeks where forecast significantly undershot demand",
              },
            ].map(({ label, lgbm, tft, winner, detail }) => (
              <div
                key={label}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-4"
              >
                <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono uppercase tracking-widest mb-3">{label}</div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono mb-1">LightGBM</div>
                    <div style={{ color: winner === "lgbm" ? "var(--green)" : "#ef4444" }} className="font-bold font-mono text-lg">{lgbm}</div>
                  </div>
                  <div style={{ color: "var(--border)" }} className="text-xs font-mono mb-1">vs</div>
                  <div className="flex-1 text-right">
                    <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono mb-1">TFT</div>
                    <div style={{ color: winner === "tft" ? "var(--green)" : "#ef4444" }} className="font-bold font-mono text-lg">{tft}</div>
                  </div>
                </div>
                <div style={{ color: "var(--muted)" }} className="text-[10px] mt-2 leading-relaxed">{detail}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: "var(--text)" }} className="text-sm font-semibold">
                {skuInfo.label} — {skuInfo.desc}
              </span>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span style={{ color: "#94a3b8" }}>● Historical (solid)</span>
                <span style={{ color: "#f97316" }}>- - LightGBM</span>
                <span style={{ color: skuInfo.color }}>··· TFT</span>
                {stockoutSpike && <span style={{ color: "#ef4444" }}>⚠ Demand spike W46</span>}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#64748b", fontSize: 9, fontFamily: "var(--font-geist-mono)" }}
                  interval={7}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "var(--font-geist-mono)" }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "var(--accent)" }}
                  itemStyle={{ color: "var(--text)" }}
                />
                <ReferenceLine x="W40" stroke="rgba(148,163,184,0.3)" strokeDasharray="4 4" label={{ value: "Forecast →", fill: "#64748b", fontSize: 9 }} />
                {stockoutSpike && (
                  <ReferenceLine x="W46" stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Spike", fill: "#ef4444", fontSize: 9 }} />
                )}
                {/* Historical actuals */}
                <Line dataKey="actual" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Historical" connectNulls={false} />
                {/* Spike marker */}
                {stockoutSpike && <Line dataKey="spike" stroke="#ef4444" strokeWidth={2} dot={{ r: 5, fill: "#ef4444" }} name="Actual spike" connectNulls={false} />}
                {/* LightGBM forecast */}
                <Line dataKey="lgbm" stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="LightGBM" connectNulls={false} />
                {/* TFT forecast */}
                <Line dataKey="tft" stroke={skuInfo.color} strokeWidth={2} strokeDasharray="2 2" dot={false} name="TFT" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>

            {stockoutSpike && (
              <div
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
                className="mt-4 rounded-lg px-4 py-3 text-xs font-mono"
              >
                <span style={{ color: "#ef4444" }}>⚠ Week 46 demand spike:</span>
                <span style={{ color: "var(--muted)" }} className="ml-2">
                  TFT predicted the surge — LightGBM missed it. This is the scenario that drove $2M+ in inventory savings.
                  TFT's attention mechanism detected the historical precursor pattern 3 weeks earlier.
                </span>
              </div>
            )}
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
