"use client";
import { useEffect, useRef, useState } from "react";
import { personal } from "@/lib/data/portfolio";

const ROLES = ["Technical Lead", "GenAI Engineer", "Full-Stack Builder", "IoT Architect"];

// Canvas starfield — SSR-safe (only runs in useEffect)
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
    />
  );
}

export default function Hero() {
  // Typewriter
  const [display, setDisplay] = useState(ROLES[0]);
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(ROLES[0].length);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    const role = ROLES[roleIdx];
    const delay = deleting ? 45 : charIdx === role.length ? 1800 : 90;
    const t = setTimeout(() => {
      if (!deleting && charIdx < role.length) {
        setCharIdx((c) => c + 1);
        setDisplay(role.slice(0, charIdx + 1));
      } else if (!deleting && charIdx === role.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setCharIdx((c) => c - 1);
        setDisplay(role.slice(0, charIdx - 1));
      } else {
        setDeleting(false);
        setRoleIdx((i) => (i + 1) % ROLES.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [mounted, charIdx, deleting, roleIdx]);

  return (
    <section
      id="top"
      className="relative flex items-center justify-center"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <Starfield />

      {/* Radial vignette to keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(5,10,20,0.75) 100%)",
        }}
        aria-hidden
      />

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 160, background: "linear-gradient(to bottom, transparent, var(--bg))" }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-5">
        {/* Eyebrow stat */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span
            style={{
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--accent)",
            }}
            className="text-xs font-mono px-3 py-1 rounded-full"
          >
            {personal.yearsExperience} Years Experience
          </span>
          <span
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#c4b5fd",
            }}
            className="text-xs font-mono px-3 py-1 rounded-full"
          >
            {personal.subtitle}
          </span>
        </div>

        {/* Name */}
        <h1
          style={{ color: "var(--text)", lineHeight: 1.1 }}
          className="text-5xl sm:text-7xl font-bold tracking-tight"
        >
          {personal.name}
        </h1>

        {/* Typewriter role */}
        <div className="h-10 flex items-center justify-center">
          <h2
            style={{ fontFamily: "var(--font-geist-mono)", color: "var(--accent)" }}
            className="text-xl sm:text-2xl font-medium"
          >
            {display}
            <span
              style={{ borderRight: "2px solid var(--accent)", marginLeft: 2 }}
              className="inline-block h-6 animate-pulse"
              aria-hidden
            />
          </h2>
        </div>

        {/* Bio */}
        <p
          style={{ color: "var(--muted)", maxWidth: 560 }}
          className="text-base sm:text-lg leading-relaxed"
        >
          {personal.bio}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            }}
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
              style={{
                border: "1px solid var(--border)",
                color: "var(--text)",
                background: "rgba(255,255,255,0.04)",
              }}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Download Resume
            </a>
          )}
        </div>

        {/* Azure cert badge */}
        {personal.certification.map((cert) =>

          <div
            key={cert.name}
            style={{
              background: "rgba(0,120,212,0.12)",
              border: "1px solid rgba(0,120,212,0.35)",
            }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full mt-1"
          >
            {/* Azure logo mark — simple SVG */}
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M9 0L17.66 15.75H0.34L9 0Z" fill="#0078D4" opacity="0.8" />
              <path d="M5 10L10 3L15 10H5Z" fill="#50E6FF" opacity="0.7" />
            </svg>
            <span className="text-xs font-mono" style={{ color: "#93c5fd" }}>
              {cert.link == "" ? cert.name :
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cert.name}
                </a>}
            </span>
          </div>
        )}

        {/* Scroll hint */}
        <div className="mt-8 flex flex-col items-center gap-1 animate-bounce opacity-40">
          <div style={{ width: 1, height: 40, background: "var(--muted)" }} />
          <span style={{ color: "var(--muted)" }} className="text-[10px] font-mono tracking-widest uppercase">
            scroll
          </span>
        </div>
      </div>
    </section>
  );
}
