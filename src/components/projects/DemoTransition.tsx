"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  label?: string;
}

export default function DemoTransition({ label = "See it in action" }: Props) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = dividerRef.current;
    if (!el) return;
    // Sticky sentinel: observe when the original element leaves viewport
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;";
    el.parentElement?.insertBefore(sentinel, el);

    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-48px 0px 0px 0px" }
    );
    obs.observe(sentinel);
    return () => { obs.disconnect(); sentinel.remove(); };
  }, []);

  return (
    <>
      {/* Sticky pill that appears when divider scrolls past nav */}
      {stuck && (
        <div
          style={{
            position: "fixed",
            top: 48,
            left: 0,
            right: 0,
            zIndex: 40,
            background: "rgba(5,10,20,0.92)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
          className="flex items-center justify-center py-2"
        >
          <span style={{ color: "var(--accent)" }} className="text-xs font-mono tracking-widest uppercase">
            ↓ Demo below
          </span>
        </div>
      )}

      {/* The divider itself */}
      <div
        ref={dividerRef}
        style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
        className="py-10 flex items-center justify-center gap-4"
      >
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, var(--border))", maxWidth: 200 }} />
        <span
          style={{
            color: "var(--text)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
          className="text-sm font-mono px-5 py-2 rounded-full whitespace-nowrap"
        >
          {label} ↓
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, var(--border))", maxWidth: 200 }} />
      </div>
    </>
  );
}
