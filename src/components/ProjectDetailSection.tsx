import Link from "next/link";

const TAG_PALETTE = [
  { bg: "rgba(0,212,255,0.08)",  text: "#67e8f9", border: "rgba(0,212,255,0.2)" },
  { bg: "rgba(124,58,237,0.08)", text: "#c4b5fd", border: "rgba(124,58,237,0.2)" },
  { bg: "rgba(16,185,129,0.08)", text: "#6ee7b7", border: "rgba(16,185,129,0.2)" },
  { bg: "rgba(251,191,36,0.08)", text: "#fbbf24", border: "rgba(251,191,36,0.2)" },
  { bg: "rgba(6,182,212,0.08)",  text: "#22d3ee", border: "rgba(6,182,212,0.2)" },
];

interface Props {
  name: string;
  icon: string;
  description: string;
  highlights: string[];
  tags: string[];
  period?: string;
  role?: string;
  team?: number;
  demoLabel?: string;
}

export default function ProjectDetailSection({
  name, icon, description, highlights, tags,
  period, role, team, demoLabel = "Interactive Demo",
}: Props) {
  return (
    <section
      className="flex flex-col"
      style={{ minHeight: "100vh", paddingTop: 48, background: "var(--bg)" }}
    >
      {/* Top bar: back link + meta */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <Link
          href="/"
          className="text-xs font-mono hover:text-white transition-colors"
          style={{ color: "var(--muted)" }}
        >
          ← Back to Portfolio
        </Link>
        {(period || role || team) && (
          <div className="flex items-center gap-2 text-xs font-mono flex-wrap justify-end">
            {period && <span style={{ color: "var(--muted)" }}>{period}</span>}
            {role && (
              <>
                {period && <span style={{ color: "var(--border)" }}>·</span>}
                <span style={{ color: "var(--accent)" }}>{role}</span>
              </>
            )}
            {team && (
              <>
                <span style={{ color: "var(--border)" }}>·</span>
                <span style={{ color: "var(--muted)" }}>Team of {team}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 flex items-center px-6 py-16">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
          {/* Icon + name */}
          <div>
            <div className="text-5xl mb-5" aria-hidden>{icon}</div>
            <h1
              className="font-bold"
              style={{ color: "var(--text)", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
            >
              {name}
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--muted)", maxWidth: 620 }}
          >
            {description}
          </p>

          {/* Highlights */}
          <div className="flex flex-col gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-1 text-sm"
                  style={{ color: "var(--accent)" }}
                  aria-hidden
                >
                  ◆
                </span>
                <span className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text)" }}>
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => {
              const p = TAG_PALETTE[i % TAG_PALETTE.length];
              return (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: p.bg,
                    color: p.text,
                    border: `1px solid ${p.border}`,
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="flex flex-col items-center gap-2 py-8 shrink-0" aria-hidden>
        <span
          className="text-[10px] font-mono uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          {demoLabel} ↓
        </span>
        <div style={{ width: 1, height: 32, background: "var(--muted)", opacity: 0.35 }} />
      </div>
    </section>
  );
}
