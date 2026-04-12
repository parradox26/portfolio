"use client";
import Link from "next/link";
import { projects } from "@/lib/data/portfolio";
import { useInView } from "@/hooks/useInView";
import { ArrowUpRight, ExternalLink } from "lucide-react";

// Tag palette — same system as About
const TAG_PALETTE = [
  { bg: "rgba(0,212,255,0.08)",   text: "#67e8f9", border: "rgba(0,212,255,0.2)" },
  { bg: "rgba(124,58,237,0.08)",  text: "#c4b5fd", border: "rgba(124,58,237,0.2)" },
  { bg: "rgba(16,185,129,0.08)",  text: "#6ee7b7", border: "rgba(16,185,129,0.2)" },
  { bg: "rgba(251,191,36,0.08)",  text: "#fbbf24", border: "rgba(251,191,36,0.2)" },
  { bg: "rgba(6,182,212,0.08)",   text: "#22d3ee", border: "rgba(6,182,212,0.2)" },
];

function tagStyle(index: number) {
  return TAG_PALETTE[index % TAG_PALETTE.length];
}

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const { ref, inView } = useInView();
  const pal = tagStyle(index);

  if (project.highlight) {
    // Hero project — full width, glowing border
    return (
      <div
        ref={ref}
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: `opacity 0.6s ease, transform 0.6s ease`,
        }}
        className="sm:col-span-2 lg:col-span-3"
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(13,27,46,1) 60%)",
            border: "1px solid rgba(0,212,255,0.4)",
            boxShadow: "0 0 40px rgba(0,212,255,0.08)",
          }}
          className="rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl">🛰️</span>
              <span
                style={{
                  background: "rgba(0,212,255,0.15)",
                  color: "var(--accent)",
                  border: "1px solid rgba(0,212,255,0.4)",
                }}
                className="text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5"
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }}
                  className="inline-block animate-pulse"
                />
                Live Demo
              </span>
            </div>
            <h3 style={{ color: "var(--text)" }} className="font-bold text-2xl sm:text-3xl leading-tight">
              {project.name}
            </h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }} className="text-sm sm:text-base">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag, ti) => {
                const p = tagStyle(ti);
                return (
                  <span
                    key={tag}
                    style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}`, fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
                    className="px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            {project.link && (
              <Link
                href={project.link}
                style={{ background: "var(--accent)", color: "#050a14" }}
                className="self-start flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                View Project
                <ExternalLink size={14} />
              </Link>
            )}
          </div>

          {/* Visual placeholder — globe silhouette */}
          <div
            className="hidden sm:flex items-center justify-center"
            style={{ minHeight: 200 }}
          >
            <div className="relative">
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #112240, #050a14)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  boxShadow: "0 0 60px rgba(0,212,255,0.15)",
                }}
              />
              {/* Orbit rings */}
              {[190, 220, 250].map((size, i) => (
                <div
                  key={size}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    border: `1px solid rgba(0,212,255,${0.15 - i * 0.04})`,
                    transform: `translate(-50%, -50%) rotateX(${60 + i * 10}deg)`,
                  }}
                />
              ))}
              {/* Satellite dot */}
              <div
                style={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 10px var(--accent)",
                  top: "10%",
                  right: "15%",
                }}
                className="animate-pulse"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard card
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${(index % 3) * 0.1}s, transform 0.6s ease ${(index % 3) * 0.1}s`,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          height: "100%",
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        }}
        className="rounded-xl p-5 flex flex-col gap-3 group hover:scale-[1.015]"
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = pal.border;
          el.style.boxShadow = `0 0 20px ${pal.bg}`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.boxShadow = "none";
        }}
      >
        <h3 style={{ color: "var(--text)" }} className="font-semibold text-base leading-tight">
          {project.name}
        </h3>
        <p style={{ color: "var(--muted)", lineHeight: 1.65 }} className="text-sm flex-1">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {project.tags.map((tag, ti) => {
            const p = tagStyle(ti + index);
            return (
              <span
                key={tag}
                style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}`, fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                className="px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            );
          })}
        </div>
        <div className="mt-auto pt-2">
          {project.link ? (
            <Link
              href={project.link}
              style={{ color: "var(--accent)" }}
              className="inline-flex items-center gap-1 text-xs font-mono hover:underline"
            >
              View Project <ArrowUpRight size={12} />
            </Link>
          ) : (
            <span style={{ color: "var(--muted)" }} className="inline-flex items-center gap-1 text-xs font-mono">
              Case Study
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="py-24 px-4 sm:px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-6xl mx-auto">
        <p
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-xs tracking-widest uppercase mb-2"
        >
          03 / projects
        </p>
        <h2 style={{ color: "var(--text)" }} className="text-3xl sm:text-4xl font-bold mb-12">
          Selected Work
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
