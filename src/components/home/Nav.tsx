"use client";
import { useEffect, useState } from "react";
import { personal } from "@/lib/data/portfolio";

const LINKS = [
  { label: "About",      id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects",   id: "projects" },
  { label: "Contact",    id: "contact" },
];

export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState("");
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers = LINKS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const [first, ...rest] = personal.name.split(" ");

  return (
    <nav
      style={{
        background: scrolled ? "rgba(5,10,20,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(30,58,95,0.7)" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ fontFamily: "var(--font-geist-mono)" }}
          className="text-sm font-bold flex items-center gap-0"
        >
          <span style={{ color: "var(--accent)" }}>{first}</span>
          <span style={{ color: "var(--muted)" }}>&#46;{rest[0]?.charAt(0).toLowerCase()}</span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                color: active === id ? "var(--accent)" : "var(--muted)",
                borderBottom: active === id ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              className="text-sm px-3 py-1 transition-colors hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{ color: "var(--muted)" }}
          className="sm:hidden flex flex-col gap-1.5 p-1"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ background: "var(--muted)", transition: "all 0.2s" }}
              className="block w-5 h-0.5"
            />
          ))}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{ background: "rgba(5,10,20,0.97)", borderBottom: "1px solid var(--border)" }}
          className="sm:hidden px-4 pb-4 flex flex-col gap-2"
        >
          {LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ color: active === id ? "var(--accent)" : "var(--muted)" }}
              className="text-sm py-2 text-left hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
