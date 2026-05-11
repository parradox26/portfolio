"use client";
import { useEffect, useRef, useState } from "react";
import { personal } from "@/lib/data/portfolio";
import Marquee from "./Marquee";

const ROLES = ["Technical Lead", "GenAI Engineer", "Full-Stack Builder", "IoT Architect"];

const MARQUEE_ITEMS = [
  "Satellite Mission Control", "GenAI Pipelines", "Smart City IoT",
  "ML Optimisation", "Multi-Tenant SaaS", "CubeSat TT&C",
  "Demand Forecasting", "Cloud-Native", "Real-Time Systems",
];

// ── Starfield ────────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.3 + Math.random() * 1.4,
      base: 0.2 + Math.random() * 0.6,
      speed: 0.0004 + Math.random() * 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    let id: number;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const o = s.base * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${o})`;
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden />;
}

// ── Hero ─────────────────────────────────────────────────────────
export default function Hero() {
  const outerRef   = useRef<HTMLDivElement>(null);
  const [progress,  setProgress]  = useState(0);
  const [display,   setDisplay]   = useState(ROLES[0]);
  const [roleIdx,   setRoleIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(ROLES[0].length);
  const [deleting,  setDeleting]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => { if (data.url) setResumeUrl(data.url); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const role  = ROLES[roleIdx];
    const delay = deleting ? 45 : charIdx === role.length ? 1800 : 90;
    const t = setTimeout(() => {
      if (!deleting && charIdx < role.length) {
        setCharIdx((c) => c + 1); setDisplay(role.slice(0, charIdx + 1));
      } else if (!deleting && charIdx === role.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setCharIdx((c) => c - 1); setDisplay(role.slice(0, charIdx - 1));
      } else {
        setDeleting(false); setRoleIdx((i) => (i + 1) % ROLES.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [mounted, charIdx, deleting, roleIdx]);

  // Scroll progress through the outer 240vh container
  useEffect(() => {
    const onScroll = () => {
      const outer = outerRef.current;
      if (!outer) return;
      const rect     = outer.getBoundingClientRect();
      const scrolled = -rect.top;
      const max      = rect.height - window.innerHeight;
      if (max <= 0) return;
      setProgress(Math.max(0, Math.min(1, scrolled / max)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [firstName, lastName] = personal.name.split(" ");

  // ── Derived animation values ───────────────────────────────────
  //
  // Stage 0 (progress 0–0.33): firstName alone, huge → normal font size
  // Stage 1 (progress 0.33–0.51): lastName slides in below
  // Stage 2 (progress 0.67–0.89): full page content fades in
  //
  const nameP      = Math.min(1, progress / 0.33);
  // Font interpolation: 14vw / 14rem → 10vw / 7rem
  const fontVW     = (14 - 4 * nameP).toFixed(2);
  const fontMaxRem = (14 - 7 * nameP).toFixed(2);
  const firstName_fs = `clamp(3rem, ${fontVW}vw, ${fontMaxRem}rem)`;

  const lastNameOp  = Math.max(0, Math.min(1, (progress - 0.33) / 0.18));
  const lastNameY   = (1 - lastNameOp) * 32;
  const showLastName = lastNameOp > 0.01;

  const contentOp  = Math.max(0, Math.min(1, (progress - 0.67) / 0.22));
  const showContent = contentOp > 0.01;

  const hintOp = Math.max(0, 1 - progress / 0.2) * 0.4;

  return (
    <div ref={outerRef} id="top" style={{ height: "240vh", position: "relative" }}>
      <section
        className="relative flex flex-col"
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
      >
        <Starfield />
        <div className="noise-overlay" aria-hidden />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(5,10,20,0.8) 100%)" }}
          aria-hidden
        />

        {/* Decorative background "ENGINEER" */}
        <div
          aria-hidden
          style={{
            position: "absolute", bottom: "8%", left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(5rem,18vw,16rem)", fontWeight: 900,
            color: "var(--accent)", opacity: 0.025,
            fontFamily: "var(--font-geist-sans)",
            letterSpacing: "-0.04em", whiteSpace: "nowrap",
            userSelect: "none", pointerEvents: "none", lineHeight: 1,
          }}
        >
          ENGINEER
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 160, background: "linear-gradient(to bottom, transparent, var(--bg))" }}
          aria-hidden
        />

        {/* ── Main flex content ───────────────────────────────── */}
        {/* When only the name is present (stage 0–1) it is the sole flex item
            and justify-center places it at true vertical mid-point.           */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center gap-5 pt-24 pb-32">

          {/* Eyebrow chips — only in layout when content stage reached */}
          {showContent && (
            <div
              className="flex items-center gap-3 flex-wrap justify-center"
              style={{
                opacity: contentOp,
                transform: `translateY(${(1 - contentOp) * 20}px)`,
                pointerEvents: contentOp > 0.5 ? "auto" : "none",
              }}
            >
              <span style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "var(--accent)" }} className="text-xs font-mono px-3 py-1 rounded-full">
                {personal.yearsExperience} Years Experience
              </span>
              <span style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }} className="text-xs font-mono px-3 py-1 rounded-full">
                {personal.subtitle}
              </span>
            </div>
          )}

          {/* Name block */}
          <div style={{ lineHeight: 1.05 }}>
            {/* firstName — always in layout, font shrinks on scroll */}
            <h1
              style={{
                color: "var(--text)",
                fontSize: firstName_fs,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 0.55s ease, transform 0.55s ease",
              }}
            >
              {firstName}
            </h1>

            {/* lastName — enters layout only once it starts appearing */}
            {showLastName && (
              <h1
                style={{
                  color: "var(--accent)",
                  fontSize: "clamp(3rem, 10vw, 7rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  opacity: lastNameOp,
                  transform: `translateY(${lastNameY}px)`,
                }}
              >
                {lastName}
              </h1>
            )}
          </div>

          {/* Typewriter role */}
          {showContent && (
            <div
              className="h-10 flex items-center justify-center"
              style={{
                opacity: contentOp,
                transform: `translateY(${(1 - contentOp) * 16}px)`,
                pointerEvents: "none",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-geist-mono)", color: "var(--accent)" }} className="text-xl sm:text-2xl font-medium">
                {display}
                <span style={{ borderRight: "2px solid var(--accent)", marginLeft: 2 }} className="inline-block h-6 animate-pulse" aria-hidden />
              </h2>
            </div>
          )}

          {/* Bio */}
          {showContent && (
            <p
              style={{
                color: "var(--muted)", maxWidth: 560,
                opacity: contentOp,
                transform: `translateY(${(1 - contentOp) * 16}px)`,
              }}
              className="text-base sm:text-lg leading-relaxed"
            >
              {personal.bio}
            </p>
          )}

          {/* CTAs */}
          {showContent && (
            <div
              className="flex flex-wrap gap-3 justify-center mt-2"
              style={{ opacity: contentOp, pointerEvents: contentOp > 0.5 ? "auto" : "none" }}
            >
              <a
                href="#projects"
                onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ background: "var(--accent)", color: "#050a14" }}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                View Projects
              </a>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ border: "1px solid var(--border)", color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Download Resume
                </a>
              )}
            </div>
          )}

          {/* Azure cert badge */}
          {showContent && (
            <div style={{ opacity: contentOp, pointerEvents: contentOp > 0.5 ? "auto" : "none" }}>
              {personal.certification.map((cert) => (
                <div
                  key={cert.name}
                  style={{ background: "rgba(0,120,212,0.12)", border: "1px solid rgba(0,120,212,0.35)" }}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full mt-1"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path d="M9 0L17.66 15.75H0.34L9 0Z" fill="#0078D4" opacity="0.8" />
                    <path d="M5 10L10 3L15 10H5Z" fill="#50E6FF" opacity="0.7" />
                  </svg>
                  <span className="text-xs font-mono" style={{ color: "#93c5fd" }}>
                    {cert.link
                      ? <a href={cert.link} target="_blank" rel="noopener noreferrer">{cert.name}</a>
                      : cert.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll hint — absolute so it doesn't affect flex centering */}
        <div
          className="absolute bottom-12 left-1/2 z-20 flex flex-col items-center gap-1 animate-bounce"
          style={{ transform: "translateX(-50%)", opacity: hintOp, pointerEvents: "none" }}
          aria-hidden
        >
          <div style={{ width: 1, height: 40, background: "var(--muted)" }} />
          <span style={{ color: "var(--muted)" }} className="text-[10px] font-mono tracking-widest uppercase">scroll</span>
        </div>

        {/* Marquee strip */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            borderTop: "1px solid var(--border)",
            background: "rgba(5,10,20,0.6)",
            backdropFilter: "blur(8px)",
            padding: "12px 0",
            opacity: contentOp,
          }}
        >
          <Marquee items={MARQUEE_ITEMS} speed={32} />
        </div>
      </section>
    </div>
  );
}
