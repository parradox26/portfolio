"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectMetrics from "@/components/projects/ProjectMetrics";
import ArchitectureDiagram from "@/components/projects/ArchitectureDiagram";
import DemoTransition from "@/components/projects/DemoTransition";
import ProjectNav from "@/components/projects/ProjectNav";
import SatelliteTracker2DClient from "@/components/SatelliteTracker2DClient";
import { projectDetails, PROJECT_NAV_ORDER } from "@/lib/data/portfolio";

const detail = projectDetails["cubesat"];
const navIdx = PROJECT_NAV_ORDER.findIndex((p) => p.slug === "cubesat");
const prevProject = navIdx > 0 ? PROJECT_NAV_ORDER[navIdx - 1] : undefined;
const nextProject = navIdx < PROJECT_NAV_ORDER.length - 1 ? PROJECT_NAV_ORDER[navIdx + 1] : undefined;

interface Message { role: "user" | "assistant"; content: string }

const STARTERS = [
  "What's the command sequence to initiate an imaging pass over the Thar Desert?",
  "How do I recover from a safe mode event?",
  "What are the power constraints during eclipse?",
];

// Typewriter effect
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const iRef = useRef(0);

  useEffect(() => {
    iRef.current = 0;
    setDisplayed("");
    const id = setInterval(() => {
      iRef.current++;
      setDisplayed(text.slice(0, iRef.current));
      if (iRef.current >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, 12);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <>{displayed}</>;
}

export default function CubeSatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setError("");
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/cubesat-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      if (res.status === 429) {
        setError("Rate limit reached. Please try again later.");
        return;
      }
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.content }]);
      setTyping(true);
    } catch {
      setError("Connection failed. Make sure GROQ_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <ProjectHero
        name={detail.name}
        icon={detail.icon}
        tagline={detail.tagline}
        year={detail.year}
        role={detail.role}
        techStack={detail.techStack}
        metricsSummary={detail.metrics.map((m) => ({ label: m.label, value: m.value }))}
        demoLabel="OSCAR RAG Terminal"
      />
      <ProjectOverview paragraphs={detail.overview} />
      <ProjectMetrics metrics={detail.metrics} />
      <ArchitectureDiagram nodes={detail.architecture.nodes} edges={detail.architecture.edges} />

      {/* ── Satellite Tracker ── */}
      <DemoTransition label="Orbital Ground Track" />

      <div className="flex flex-col" style={{ height: "100vh", background: "var(--bg)" }}>
        <div
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3 shrink-0"
        >
          <div>
            <h2 style={{ color: "var(--text)" }} className="font-bold text-base">🛰️ Genmat-01 Orbital Ground Track</h2>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono mt-0.5">
              SGP4 propagation · 18 satellites · Mercator projection · click to inspect
            </p>
          </div>
          <span
            style={{ background: "var(--surface2)", color: "var(--green)", border: "1px solid var(--green)" }}
            className="text-[10px] font-mono px-3 py-1 rounded-full"
          >
            ● LIVE
          </span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div style={{ position: "absolute", inset: 0 }}>
            <SatelliteTracker2DClient />
          </div>
        </div>
        <div
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
          className="px-6 py-3 flex flex-wrap gap-6 text-xs font-mono shrink-0"
        >
          {[
            ["Orbit", "500km SSO — 97.4° inclination"],
            ["Propagation", "SGP4 / satellite.js"],
            ["Payload", "Hyperspectral imager 400–2500nm"],
            ["Downlink", "X-band 20 Mbps"],
            ["Update rate", "1 s interval"],
          ].map(([k, v]) => (
            <span key={k}>
              <span style={{ color: "var(--muted)" }}>{k}: </span>
              <span style={{ color: "var(--accent)" }}>{v}</span>
            </span>
          ))}
        </div>
      </div>
      <DemoTransition label="OSCAR Command Assistant" />

      {/* Demo: OSCAR RAG Terminal */}
      <div style={{ background: "var(--bg)" }}>
        <div
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3"
        >
          <div>
            <h2 style={{ color: "var(--text)" }} className="font-bold text-base">🛸 OSCAR — Orbital Satellite Command Assistant RAG</h2>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono mt-0.5">
              LangChain · Neo4j vector search · Groq Llama 3.3 70B
            </p>
          </div>
          <span
            style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}
            className="text-[10px] font-mono px-3 py-1 rounded-full"
          >
            ● ONLINE
          </span>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Terminal window */}
          <div
            style={{
              background: "#080e18",
              border: "1px solid rgba(6,182,212,0.25)",
              boxShadow: "0 0 40px rgba(6,182,212,0.05)",
            }}
            className="rounded-xl overflow-hidden"
          >
            {/* Terminal bar */}
            <div
              style={{ background: "#0a1525", borderBottom: "1px solid rgba(6,182,212,0.15)" }}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
              </div>
              <span style={{ color: "#06b6d4" }} className="text-[10px] font-mono">OSCAR v2.4.1 // GENMAT-01 // CONNECTED</span>
              <span style={{ color: "rgba(6,182,212,0.5)" }} className="text-[10px] font-mono">Alt+500km SSO</span>
            </div>

            {/* Message feed */}
            <div
              ref={feedRef}
              className="p-5 font-mono text-sm space-y-4"
              style={{ minHeight: 340, maxHeight: 480, overflowY: "auto", color: "#a0f0d0" }}
            >
              {messages.length === 0 && (
                <div style={{ color: "rgba(6,182,212,0.5)" }}>
                  <p>OSCAR // Genmat-01 Mission Control Terminal</p>
                  <p>Neo4j vector search active — {`>`} 1,200 command library documents indexed</p>
                  <p className="mt-3">Type a query or select a starter below ↓</p>
                </div>
              )}

              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                if (m.role === "user") {
                  return (
                    <div key={i}>
                      <span style={{ color: "rgba(6,182,212,0.6)" }}>OPERATOR {`>`} </span>
                      <span style={{ color: "#e2e8f0" }}>{m.content}</span>
                    </div>
                  );
                }
                return (
                  <div key={i} className="space-y-1">
                    <div style={{ color: "rgba(6,182,212,0.45)" }} className="text-[10px]">
                      OSCAR // Neo4j vector search → 3 relevant documents retrieved
                    </div>
                    <div style={{ color: "#4ade80" }}>
                      {isLast && typing ? (
                        <TypewriterText text={m.content} onDone={() => setTyping(false)} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ color: "rgba(6,182,212,0.5)" }} className="animate-pulse text-xs">
                  OSCAR // Neo4j vector search → retrieving documents...
                </div>
              )}

              {error && (
                <div style={{ color: "#ef4444" }} className="text-xs">{error}</div>
              )}
            </div>

            {/* Input */}
            <div
              style={{ borderTop: "1px solid rgba(6,182,212,0.15)", background: "#0a1525" }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span style={{ color: "#06b6d4" }} className="font-mono text-sm shrink-0">OPERATOR {">"}</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Enter command query..."
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 13,
                  flex: 1,
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                style={{
                  background: "rgba(6,182,212,0.15)",
                  border: "1px solid rgba(6,182,212,0.3)",
                  color: "#06b6d4",
                }}
                className="text-xs font-mono px-3 py-1 rounded disabled:opacity-40"
              >
                SEND
              </button>
            </div>
          </div>

          {/* Starter chips */}
          {messages.length === 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  style={{
                    background: "rgba(6,182,212,0.06)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "#06b6d4",
                  }}
                  className="text-xs font-mono px-3 py-2 rounded-lg text-left hover:bg-[rgba(6,182,212,0.12)] transition-colors disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>



      <ProjectNav
        prev={prevProject ? { name: prevProject.name, href: prevProject.href, icon: prevProject.icon } : undefined}
        next={nextProject ? { name: nextProject.name, href: nextProject.href, icon: nextProject.icon } : undefined}
      />
    </>
  );
}
