"use client";
import { personal, education } from "@/lib/data/portfolio";
import { useInView } from "@/hooks/useInView";
import { Mail, MapPin } from "lucide-react";

// Brand SVG icons (lucide-react doesn't include these)
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Contact() {
  const { ref, inView } = useInView();

  return (
    <section
      id="contact"
      className="py-24 px-4 sm:px-6"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-3xl mx-auto">
        <p
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-xs tracking-widest uppercase mb-2"
        >
          04 / contact
        </p>
        <h2 style={{ color: "var(--text)" }} className="text-3xl sm:text-4xl font-bold mb-6">
          Get In Touch
        </h2>

        <div
          ref={ref}
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
          className="flex flex-col gap-8"
        >
          <p style={{ color: "var(--muted)", lineHeight: 1.75 }} className="text-base max-w-xl">
            Open to senior engineering and technical lead roles — reach out.
          </p>

          {/* Contact links */}
          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${personal.email}`}
              style={{ color: "var(--text)", border: "1px solid var(--border)", background: "var(--surface2)", transition: "border-color 0.2s" }}
              className="flex items-center gap-4 px-5 py-4 rounded-xl hover:border-[var(--accent)] group"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
            >
              <div
                style={{ background: "rgba(232,150,60,0.1)", border: "1px solid rgba(232,150,60,0.2)" }}
                className="p-2.5 rounded-lg"
              >
                <Mail size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <div style={{ color: "var(--muted)" }} className="text-[11px] font-mono uppercase tracking-wider mb-0.5">
                  Email
                </div>
                <div style={{ color: "var(--text)" }} className="text-sm">
                  {personal.email}
                </div>
              </div>
            </a>

            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text)", border: "1px solid var(--border)", background: "var(--surface2)" }}
              className="flex items-center gap-4 px-5 py-4 rounded-xl"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#0a66c2")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
            >
              <div
                style={{ background: "rgba(10,102,194,0.12)", border: "1px solid rgba(10,102,194,0.25)" }}
                className="p-2.5 rounded-lg"
              >
                <LinkedInIcon />
              </div>
              <div>
                <div style={{ color: "var(--muted)" }} className="text-[11px] font-mono uppercase tracking-wider mb-0.5">
                  LinkedIn
                </div>
                <div style={{ color: "var(--text)" }} className="text-sm">
                  linkedin.com/in/shresthdeep-gupta-09b118170
                </div>
              </div>
            </a>

            {personal.github && (
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--text)", border: "1px solid var(--border)", background: "var(--surface2)" }}
                className="flex items-center gap-4 px-5 py-4 rounded-xl"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#6e5494")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
              >
                <div
                  style={{ background: "rgba(110,84,148,0.12)", border: "1px solid rgba(110,84,148,0.25)" }}
                  className="p-2.5 rounded-lg"
                >
                  <GitHubIcon />
                </div>
                <div>
                  <div style={{ color: "var(--muted)" }} className="text-[11px] font-mono uppercase tracking-wider mb-0.5">
                    GitHub
                  </div>
                  <div style={{ color: "var(--text)" }} className="text-sm">
                    {personal.github}
                  </div>
                </div>
              </a>
            )}
          </div>

          {/* Education + location footnote */}
          <div
            style={{ borderTop: "1px solid var(--border)" }}
            className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "var(--muted)" }}>
              <MapPin size={12} />
              {personal.location}
              <span style={{ color: "var(--border)" }}>·</span>
              {education[0].degree}, {education[0].year}
            </div>
            <div
              style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono)" }}
              className="text-[10px]"
            >
              {personal.name} · {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
