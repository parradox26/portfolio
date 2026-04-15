import Link from "next/link";

const TAG_PALETTE = [
  { bg: "rgba(0,212,255,0.08)",   text: "#67e8f9", border: "rgba(0,212,255,0.2)"   },
  { bg: "rgba(124,58,237,0.08)",  text: "#c4b5fd", border: "rgba(124,58,237,0.2)"  },
  { bg: "rgba(16,185,129,0.08)",  text: "#6ee7b7", border: "rgba(16,185,129,0.2)"  },
  { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)"  },
  { bg: "rgba(6,182,212,0.08)",   text: "#22d3ee", border: "rgba(6,182,212,0.2)"   },
];

interface Props {
  name: string;
  icon: string;
  tagline: string;
  year: string;
  role: string;
  techStack: string[];
  metricsSummary: { label: string; value: string }[];
  demoLabel?: string;
}

export default function ProjectHero({
  name, icon, tagline, year, role, techStack, metricsSummary, demoLabel = "Interactive Demo",
}: Props) {
  return (
    <section
      style={{
        minHeight: "100vh",
        paddingTop: 48,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid pattern */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 1 }}
      >
        <Link href="/" className="text-xs font-mono transition-colors" style={{ color: "var(--muted)" }}>
          ← Portfolio
        </Link>
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap justify-end">
          <span style={{ color: "var(--muted)" }}>{year}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span style={{ color: "var(--accent)" }}>{role}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center px-6 py-16" style={{ position: "relative", zIndex: 1 }}>
        <div className="max-w-4xl mx-auto w-full">
          {/* Icon + name */}
          <div className="mb-6">
            <div className="text-6xl mb-6" aria-hidden>{icon}</div>
            <h1
              style={{
                color: "var(--text)",
                fontSize: "clamp(2.25rem, 6vw, 4rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </h1>
          </div>

          {/* Tagline */}
          <p
            style={{
              color: "var(--muted)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: 1.6,
              maxWidth: 680,
              marginBottom: "2.5rem",
            }}
          >
            {tagline}
          </p>

          {/* Metrics summary row */}
          <div className="flex flex-wrap gap-4 mb-8">
            {metricsSummary.map(({ label, value }) => (
              <div
                key={label}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-lg px-4 py-2.5 text-center min-w-[80px]"
              >
                <div style={{ color: "var(--accent)" }} className="font-bold font-mono text-lg leading-none">{value}</div>
                <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            {techStack.map((tag, i) => {
              const p = TAG_PALETTE[i % TAG_PALETTE.length];
              return (
                <span
                  key={tag}
                  style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}`, fontFamily: "var(--font-geist-mono)" }}
                  className="px-3 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="flex flex-col items-center gap-2 py-8 shrink-0" style={{ position: "relative", zIndex: 1 }} aria-hidden>
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {demoLabel} ↓
        </span>
        <div style={{ width: 1, height: 32, background: "var(--muted)", opacity: 0.35 }} />
      </div>
    </section>
  );
}
