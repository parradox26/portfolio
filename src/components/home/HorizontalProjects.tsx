"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { projects } from "@/lib/data/portfolio";

const FEATURED = projects.filter((p) => p.link).slice(0, 5);

const CARD_COLORS = [
  { accent: "#e8963c", glow: "rgba(232,150,60,0.10)",  border: "rgba(232,150,60,0.22)"  },
  { accent: "#a78bfa", glow: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.22)" },
  { accent: "#34d399", glow: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)"  },
  { accent: "#fb923c", glow: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.22)"  },
  { accent: "#818cf8", glow: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.22)" },
];

export default function HorizontalProjects() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    const bar   = barRef.current;
    if (!outer || !track || !bar) return;

    let current = 0, target = 0, rafId: number;

    const onScroll = () => {
      const rect = outer.getBoundingClientRect();
      const scrolled   = -rect.top;
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const maxX = track.scrollWidth - window.innerWidth;
      target = progress * maxX;
      bar.style.transform = `scaleX(${progress})`;
    };

    const loop = () => {
      current += (target - current) * 0.07;
      track.style.transform = `translateX(-${current}px)`;
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(loop);
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <section id="projects" style={{ background: "var(--bg)" }}>
      <div ref={outerRef} style={{ height: "320vh", position: "relative" }}>

        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

          {/* Section label */}
          <div style={{ position: "absolute", top: 32, left: 36, zIndex: 10 }}>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              03 / selected work
            </p>
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono)", fontSize: 9 }}>
              scroll to explore →
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--surface)", zIndex: 10 }}>
            <div ref={barRef} style={{ height: "100%", background: "var(--accent)", transformOrigin: "left", transform: "scaleX(0)", transition: "transform 0.05s" }} />
          </div>

          {/* Horizontal track — cards centered vertically */}
          <div
            ref={trackRef}
            style={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              willChange: "transform",
              paddingLeft: "max(36px, 6vw)",
              gap: "clamp(12px, 1.5vw, 20px)",
            }}
          >
            {/* Intro card */}
            <div style={{ minWidth: "clamp(108px, 12vw, 156px)", display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: "3vw", flexShrink: 0 }}>
              <p style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
                {FEATURED.length} featured projects
              </p>
              <h2 style={{ color: "var(--text)", fontSize: "clamp(1.75rem,3.5vw,2.75rem)", fontWeight: 800, lineHeight: 1.05, marginBottom: 16 }}>
                Selected<br />Work
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.75, maxWidth: 220 }}>
                Production systems across satellite mission control, AI pipelines, smart city IoT, and enterprise ML.
              </p>
            </div>

            {/* Project cards */}
            {FEATURED.map((project, i) => {
              const c = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <Link
                  key={project.name}
                  href={project.link!}
                  style={{
                    minWidth: "clamp(120px, 16vw, 192px)",
                    height: "clamp(300px, 62vh, 460px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "clamp(16px, 2.5vh, 28px) clamp(16px, 2vw, 28px)",
                    position: "relative",
                    flexShrink: 0,
                    borderLeft: "1px solid var(--border)",
                    borderRadius: 16,
                    background: "var(--surface)",
                    textDecoration: "none",
                    overflow: "hidden",
                    transition: "background 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = c.glow;
                    (e.currentTarget as HTMLElement).style.borderColor = c.border;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  {/* Big background number */}
                  <div style={{
                    position: "absolute", top: 16, right: 18,
                    fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1,
                    color: c.accent, opacity: 0.07, fontFamily: "var(--font-geist-mono)",
                    userSelect: "none",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Icon + index */}
                  <div style={{ marginBottom: "auto", paddingTop: "clamp(40px, 8vh, 72px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 20 }}>{project.icon}</span>
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: c.accent, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 style={{ color: "var(--text)", fontSize: "clamp(0.95rem,1.8vw,1.3rem)", fontWeight: 700, lineHeight: 1.25, marginBottom: 10 }}>
                      {project.name}
                    </h3>

                    <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>
                      {project.description}
                    </p>
                  </div>

                  {/* Tags + CTA */}
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: `${c.accent}15`,
                            border: `1px solid ${c.border}`,
                            color: c.accent,
                            fontFamily: "var(--font-geist-mono)",
                            fontSize: 9, letterSpacing: "0.08em",
                            padding: "2px 7px", borderRadius: 999,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.accent, fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
                      View project
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* End padding */}
            <div style={{ minWidth: "max(36px, 6vw)", flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
