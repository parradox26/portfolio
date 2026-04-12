"use client";
import { useState } from "react";
import { experience } from "@/lib/data/portfolio";
import { useInView } from "@/hooks/useInView";
import { ChevronDown, MapPin, Calendar, Users } from "lucide-react";

const ROLE_COLORS = ["var(--accent)", "#a78bfa", "#10b981", "#f59e0b"];

function RoleCard({
  role,
  index,
  color,
}: {
  role: (typeof experience)[number];
  index: number;
  color: string;
}) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([0]));
  const [roleExpanded, setRoleExpanded] = useState(index === 0);
  const { ref, inView } = useInView();

  const toggleProject = (i: number) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
      }}
      className="relative pl-8 sm:pl-12"
    >
      {/* Timeline dot */}
      <div
        style={{
          background: color,
          boxShadow: `0 0 12px 3px ${color}55`,
          position: "absolute",
          left: 0,
          top: 20,
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: `2px solid var(--bg)`,
        }}
      />

      {/* Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          transition: "border-color 0.2s",
        }}
        className="rounded-xl overflow-hidden"
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = color)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
      >
        {/* Role header — always visible, click to expand/collapse */}
        <button
          className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
          onClick={() => setRoleExpanded((e) => !e)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 style={{ color: "var(--text)" }} className="font-bold text-base">
                {role.role}
              </h3>
              <span
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
              >
                {role.company}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span
                style={{ color: "var(--muted)" }}
                className="flex items-center gap-1 text-xs font-mono"
              >
                <Calendar size={11} />
                {role.duration}
              </span>
              <span
                style={{ color: "var(--muted)" }}
                className="flex items-center gap-1 text-xs font-mono"
              >
                <MapPin size={11} />
                {role.location}
              </span>
            </div>
            {/* Project name previews when collapsed */}
            {!roleExpanded && (
              <div className="flex flex-wrap gap-2 mt-2">
                {role.projects.slice(0, 2).map((p) => (
                  <span
                    key={p.name}
                    style={{ color: "var(--muted)", background: "var(--surface2)", fontSize: 11 }}
                    className="font-mono px-2 py-0.5 rounded"
                  >
                    {p.name.split(" — ")[0]}
                  </span>
                ))}
                {role.projects.length > 2 && (
                  <span style={{ color: "var(--muted)", fontSize: 11 }} className="font-mono px-2 py-0.5">
                    +{role.projects.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown
            size={16}
            style={{
              color: "var(--muted)",
              transform: roleExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s",
              flexShrink: 0,
              marginTop: 4,
            }}
          />
        </button>

        {/* Projects accordion */}
        <div
          style={{
            maxHeight: roleExpanded ? "2000px" : "0",
            overflow: "hidden",
            transition: "max-height 0.4s ease",
          }}
        >
          <div
            style={{ borderTop: "1px solid var(--border)" }}
            className="px-5 py-3 flex flex-col gap-2"
          >
            {role.projects.map((project, pi) => {
              const open = expandedProjects.has(pi);
              return (
                <div
                  key={project.name}
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                  className="rounded-lg overflow-hidden"
                >
                  {/* Project header */}
                  <button
                    className="w-full text-left px-4 py-3 flex items-start justify-between gap-2"
                    onClick={() => toggleProject(pi)}
                  >
                    <div className="flex-1 min-w-0">
                      <div style={{ color: "var(--text)" }} className="text-sm font-medium leading-tight">
                        {project.name}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span style={{ color: "var(--muted)" }} className="text-[11px] font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          {project.period}
                        </span>
                        {project.team && (
                          <span style={{ color: "var(--muted)" }} className="text-[11px] font-mono flex items-center gap-1">
                            <Users size={10} />
                            Team of {project.team}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      size={14}
                      style={{
                        color: "var(--muted)",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                  </button>

                  {/* Bullets */}
                  <div
                    style={{
                      maxHeight: open ? "600px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.3s ease",
                    }}
                  >
                    <ul
                      style={{ borderTop: "1px solid var(--border)" }}
                      className="px-4 py-3 flex flex-col gap-2"
                    >
                      {project.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-2.5 text-sm">
                          <span style={{ color, flexShrink: 0, marginTop: 2 }}>▹</span>
                          <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      className="py-24 px-4 sm:px-6"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-4xl mx-auto">
        <p
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-xs tracking-widest uppercase mb-2"
        >
          02 / experience
        </p>
        <h2 style={{ color: "var(--text)" }} className="text-3xl sm:text-4xl font-bold mb-12">
          Work Experience
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            style={{ background: "var(--border)", position: "absolute", left: 5, top: 16, bottom: 0, width: 2 }}
            className="hidden sm:block"
          />
          <div
            style={{ background: "var(--border)", position: "absolute", left: 5, top: 16, bottom: 0, width: 2 }}
            className="sm:hidden"
          />

          <div className="flex flex-col gap-8">
            {experience.map((role, i) => (
              <RoleCard
                key={`${role.role}-${role.duration}`}
                role={role}
                index={i}
                color={ROLE_COLORS[i % ROLE_COLORS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
