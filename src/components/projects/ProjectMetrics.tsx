"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface Metric {
  label: string;
  value: string;
  detail: string;
}

interface Props {
  metrics: Metric[];
}

// Animate a number value up from 0 (only works for purely-numeric values)
function AnimatedValue({ value, triggered }: { value: string; triggered: boolean }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!triggered) return;
    // Extract numeric part if any
    const match = value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!match) { setDisplay(value); return; }
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr);
    const isFloat = numStr.includes(".");
    const decimals = isFloat ? (numStr.split(".")[1]?.length ?? 0) : 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;
      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [triggered, value]);

  return <span>{display}</span>;
}

export default function ProjectMetrics({ metrics }: Props) {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest uppercase mb-8 font-mono" style={{ color: "var(--accent)" }}>
          Impact & Scale
        </p>
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
              className="rounded-xl p-5"
            >
              <div style={{ color: "var(--accent)" }} className="text-2xl font-bold font-mono mb-1">
                <AnimatedValue value={m.value} triggered={inView} />
              </div>
              <div style={{ color: "var(--text)" }} className="text-sm font-semibold mb-1">{m.label}</div>
              <div style={{ color: "var(--muted)" }} className="text-xs leading-relaxed">{m.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
