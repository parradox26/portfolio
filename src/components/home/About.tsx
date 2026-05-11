"use client";
import { personal, skills } from "@/lib/data/portfolio";
import { useInView } from "@/hooks/useInView";

const PALETTE = [
  { bg: "rgba(232,150,60,0.10)",  text: "#e8963c", border: "rgba(232,150,60,0.25)"  },  // Languages
  { bg: "rgba(139,92,246,0.12)",  text: "#a78bfa", border: "rgba(139,92,246,0.28)"  },  // GenAI
  { bg: "rgba(52,211,153,0.10)",  text: "#6ee7b7", border: "rgba(52,211,153,0.25)"  },  // ML
  { bg: "rgba(232,150,60,0.07)",  text: "#fdba74", border: "rgba(232,150,60,0.20)"  },  // Frontend
  { bg: "rgba(251,191,36,0.10)",  text: "#fbbf24", border: "rgba(251,191,36,0.25)"  },  // Cloud
  { bg: "rgba(129,140,248,0.10)", text: "#a5b4fc", border: "rgba(129,140,248,0.25)" },  // Databases
  { bg: "rgba(167,139,250,0.08)", text: "#c4b5fd", border: "rgba(167,139,250,0.22)" },  // Messaging
  { bg: "rgba(139,92,246,0.07)",  text: "#ddd6fe", border: "rgba(139,92,246,0.20)"  },  // DevOps
  { bg: "rgba(52,211,153,0.07)",  text: "#34d399", border: "rgba(52,211,153,0.20)"  },  // Architecture
];

export default function About() {
  const { ref, inView } = useInView();

  return (
    <section
      id="about"
      className="py-24 px-4 sm:px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-xs tracking-widest uppercase mb-2"
        >
          01 / about
        </p>
        <h2 style={{ color: "var(--text)" }} className="text-3xl sm:text-4xl font-bold mb-12">
          About Me
        </h2>

        <div
          ref={ref}
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* Bio */}
          <div className="flex flex-col gap-5">
            <p style={{ color: "var(--text)", lineHeight: 1.8 }} className="text-base">
              I&apos;m a Technical Lead with {personal.yearsExperience} years of experience shipping
              production software at the intersection of full-stack engineering, machine learning,
              and IoT architecture. My work spans domains most engineers never touch — from
              directing real satellite mission control to building AI pipelines that replace weeks
              of manual processing with minutes.
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }} className="text-base">
              I believe in building things that move and think — not prototypes, but real systems
              running in production with SLAs, real data, and real consequences. Whether that&apos;s
              a CubeSat TT&amp;C ground station, a 1–2M events/day library platform, or an ML
              optimisation loop that improved manufacturing quality by 12%.
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }} className="text-base">
              Currently leading engineering at InnoBit Systems, Noida — building across GenAI,
              cloud-native microservices, and industrial IoT. Certified Azure AI Engineer.
            </p>

            {/* Location + contact snippets */}
            <div className="flex flex-col gap-2 mt-2">
              {[
                { label: "Location", value: personal.location },
                { label: "Email",    value: personal.email },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span style={{ color: "var(--muted)", minWidth: 64, fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
                    {label}
                  </span>
                  <span style={{ color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
            {skills.map((group, gi) => {
              const pal = PALETTE[gi % PALETTE.length];
              return (
                <div key={group.category}>
                  <p
                    style={{ color: pal.text, fontFamily: "var(--font-geist-mono)", fontSize: 11 }}
                    className="uppercase tracking-widest mb-2"
                  >
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        style={{
                          background: pal.bg,
                          border: `1px solid ${pal.border}`,
                          color: pal.text,
                          fontSize: 11,
                          fontFamily: "var(--font-geist-mono)",
                        }}
                        className="px-2 py-0.5 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
