"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useEventStream, LibEvent, EventType, BRANCHES, KIOSK_COUNTS } from "@/hooks/useEventStream";

// ── Event type display config ─────────────────────────────────────────────────

const EVENT_CFG: Record<EventType, { color: string; bg: string; label: string; routing: string }> = {
  BOOK_CHECKOUT:   { color: "#00d4ff", bg: "rgba(0,212,255,0.12)",  label: "CHECKOUT", routing: "checkout" },
  BOOK_RETURN:     { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "RETURN",   routing: "return" },
  GATE_ENTRY:      { color: "#7c3aed", bg: "rgba(124,58,237,0.12)", label: "GATE IN",  routing: "gate.entry" },
  GATE_EXIT:       { color: "#6366f1", bg: "rgba(99,102,241,0.12)", label: "GATE OUT", routing: "gate.exit" },
  KIOSK_ERROR:     { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "ERROR",    routing: "error" },
  MEMBER_REGISTER: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "NEW MBR",  routing: "member.register" },
};

// ── Small sub-components ──────────────────────────────────────────────────────

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm" style={{ color: "var(--muted)" }}>{time}</span>;
}

function Sparkline({ events }: { events: LibEvent[] }) {
  const pts = events.slice(-20);
  if (pts.length < 2) return <svg width={80} height={20} aria-hidden />;
  const lats = pts.map(e => e.latency_ms);
  const min = Math.min(...lats);
  const range = (Math.max(...lats) - min) || 1;
  const points = pts
    .map((e, i) => `${(i / (pts.length - 1)) * 78},${18 - ((e.latency_ms - min) / range) * 16}`)
    .join(" ");
  return (
    <svg width={80} height={20} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  label, value, unit = "", color = "var(--accent)",
}: { label: string; value: number; unit?: string; color?: string }) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);
  const display = Number.isInteger(value) ? value : value.toFixed(1);
  return (
    <div
      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
      className="flex-1 rounded-lg px-4 py-3 flex flex-col gap-1 min-w-0"
    >
      <div
        className="text-2xl font-bold font-mono transition-colors duration-300"
        style={{ color: flash ? color : "var(--text)" }}
      >
        {display}
        <span className="text-sm font-normal ml-0.5" style={{ color: "var(--muted)" }}>{unit}</span>
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: LibEvent["status"] }) {
  if (status === "error")   return <span style={{ color: "#ef4444" }}>✕</span>;
  if (status === "warning") return <span style={{ color: "#f59e0b" }}>⚠</span>;
  return <span style={{ color: "#10b981" }}>✓</span>;
}

function EventRow({
  event, isNew, onClick,
}: { event: LibEvent; isNew: boolean; onClick: () => void }) {
  const cfg  = EVENT_CFG[event.type];
  const time = event.timestamp.toLocaleTimeString("en-IN", { hour12: false });
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 text-xs font-mono transition-colors${isNew ? " lib-event-new" : ""}`}
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="w-20 shrink-0" style={{ color: "var(--muted)" }}>{time}</span>
      <span
        className="shrink-0 px-1.5 py-0.5 rounded text-[10px]"
        style={{ background: "var(--surface2)", color: "var(--muted)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {event.branch.split(" ").slice(0, 2).join(" ")}
      </span>
      <span
        className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold"
        style={{ background: cfg.bg, color: cfg.color, minWidth: 72, textAlign: "center" }}
      >
        {cfg.label}
      </span>
      <span className="flex-1 min-w-0 truncate" style={{ color: "var(--text)" }}>{event.member_id}</span>
      <span className="shrink-0 w-5 text-center"><StatusIcon status={event.status} /></span>
      <span
        className="shrink-0 px-2 py-0.5 rounded text-[10px]"
        style={{
          background: event.latency_ms > 180 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          color:      event.latency_ms > 180 ? "#ef4444" : "#10b981",
        }}
      >
        {event.latency_ms}ms
      </span>
    </div>
  );
}

function DetailPanel({ event, onClose }: { event: LibEvent; onClose: () => void }) {
  const cfg        = EVENT_CFG[event.type];
  const branchSlug = event.branch.toLowerCase().split(" ")[0];
  const routingKey = `branch.${branchSlug}.${cfg.routing}`;

  return (
    <div
      className="flex flex-col overflow-y-auto shrink-0"
      style={{ width: 320, borderLeft: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Event Detail
        </span>
        <button
          onClick={onClose}
          className="text-xs hover:text-white transition-colors"
          style={{ color: "var(--muted)" }}
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Type + status */}
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1.5 rounded-lg text-sm font-bold font-mono"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
          >
            {cfg.label}
          </span>
          <span
            className="px-2 py-1 rounded text-xs font-mono"
            style={{
              background: event.status === "error"   ? "rgba(239,68,68,0.12)" :
                          event.status === "warning" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
              color:      event.status === "error"   ? "#ef4444" :
                          event.status === "warning" ? "#f59e0b" : "#10b981",
            }}
          >
            {event.status.toUpperCase()}
          </span>
        </div>

        {/* Event fields */}
        <Section title="Event Fields">
          {([
            ["ID",      event.id.slice(0, 18) + "…"],
            ["Branch",  event.branch],
            ["Kiosk",   event.kiosk_id],
            ["Member",  event.member_id],
            ...(event.book_id ? [["Book", event.book_id]] as const : []),
            ["Time",    event.timestamp.toLocaleTimeString()],
            ["Latency", `${event.latency_ms}ms`],
          ] as [string, string][]).map(([k, v]) => (
            <KV key={k} k={k} v={v} />
          ))}
        </Section>

        {/* Payload */}
        {Object.keys(event.payload).length > 0 && (
          <Section title="Payload">
            {Object.entries(event.payload).map(([k, v]) => (
              <KV key={k} k={k} v={v} />
            ))}
          </Section>
        )}

        {/* RabbitMQ routing */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#7c3aed" }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "#c4b5fd" }}>
              RabbitMQ Routing
            </span>
          </div>
          {[
            ["Exchange",    "library.events"],
            ["Routing key", routingKey],
            ["Queue",       "events.processor"],
            ["Processing",  `${event.latency_ms}ms`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs font-mono">
              <span className="w-24 shrink-0" style={{ color: "#8b5cf6" }}>{k}</span>
              <span style={{ color: "#c4b5fd" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
    >
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 text-xs font-mono">
      <span className="w-16 shrink-0" style={{ color: "var(--muted)" }}>{k}</span>
      <span className="min-w-0 break-all" style={{ color: "var(--text)" }}>{v}</span>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function LibraryDashboard() {
  const { events, metrics, isRunning, toggle } = useEventStream();
  const [branchFilter, setBranchFilter]         = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent]        = useState<LibEvent | null>(null);
  const [latestId, setLatestId]                 = useState<string | null>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Track latest event id for animation
  useEffect(() => {
    const last = events[events.length - 1];
    if (last) setLatestId(last.id);
  }, [events]);

  // Auto-scroll: only if the user is already near the bottom (within 120px)
  // Uses direct scrollTop manipulation so the outer PAGE never scrolls
  useEffect(() => {
    const el = feedContainerRef.current;
    if (!el || !isRunning || selectedEvent) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [events.length, isRunning, selectedEvent]);

  const filteredEvents = useMemo(
    () => branchFilter ? events.filter(e => e.branch === branchFilter) : events,
    [events, branchFilter]
  );

  const branchEvents = useMemo(() => {
    const map: Record<string, LibEvent[]> = {};
    for (const b of BRANCHES) map[b] = events.filter(e => e.branch === b);
    return map;
  }, [events]);

  const branchHasError = useMemo(() => {
    const now = Date.now();
    const map: Record<string, boolean> = {};
    for (const b of BRANCHES) {
      map[b] = branchEvents[b].some(
        e => e.type === "KIOSK_ERROR" && now - e.timestamp.getTime() < 300_000
      );
    }
    return map;
  }, [branchEvents]);

  return (
    <>
      <style>{`
        @keyframes lib-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lib-event-new { animation: lib-slide-in 0.2s ease forwards; }
      `}</style>

      <div className="flex flex-col" style={{ height: "100vh", paddingTop: 48 }}>

        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 48,
            zIndex: 30,
          }}
        >
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-base" style={{ color: "var(--text)" }}>
              📚 Smart Library Operations Center
            </h1>
            <Clock />
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              LIVE
            </span>
            <button
              onClick={toggle}
              className="text-xs font-mono px-3 py-1 rounded transition-colors"
              style={{
                background: isRunning ? "rgba(239,68,68,0.1)"  : "rgba(16,185,129,0.1)",
                color:      isRunning ? "#ef4444"               : "#10b981",
                border:     `1px solid ${isRunning ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
              }}
            >
              {isRunning ? "⏸ Pause" : "▶ Resume"}
            </button>
            <a href="/" className="text-xs hover:text-white transition-colors" style={{ color: "var(--muted)" }}>
              ← Back
            </a>
          </div>
        </div>

        {/* ── 3-column body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Sidebar */}
          <div
            className="flex flex-col shrink-0 overflow-y-auto"
            style={{ width: 280, borderRight: "1px solid var(--border)", background: "var(--surface)" }}
          >
            <div className="px-4 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Branch Filter
              </span>
            </div>

            {/* All branches */}
            <button
              onClick={() => setBranchFilter(null)}
              className="flex items-center gap-2 px-4 py-3 text-left w-full text-xs font-mono transition-colors hover:bg-white/5"
              style={{
                borderBottom: "1px solid var(--border)",
                background: branchFilter === null ? "rgba(0,212,255,0.06)" : undefined,
                color:      branchFilter === null ? "var(--accent)" : "var(--muted)",
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#10b981" }} />
              All Branches
              <span className="ml-auto tabular-nums">{events.length}</span>
            </button>

            {/* Per-branch rows */}
            {BRANCHES.map(branch => {
              const bEvts    = branchEvents[branch];
              const hasError = branchHasError[branch];
              const isActive = branchFilter === branch;
              return (
                <button
                  key={branch}
                  onClick={() => setBranchFilter(branch)}
                  className="flex flex-col gap-2 px-4 py-3 text-left w-full transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: isActive ? "rgba(0,212,255,0.06)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: hasError ? "#f59e0b" : "#10b981" }}
                    />
                    <span
                      className="text-xs font-mono truncate"
                      style={{ color: isActive ? "var(--accent)" : "var(--text)" }}
                    >
                      {branch}
                    </span>
                    <span className="ml-auto text-[10px] tabular-nums shrink-0" style={{ color: "var(--muted)" }}>
                      {bEvts.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-4">
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                      {KIOSK_COUNTS[branch]} kiosks · {hasError ? "⚠ fault" : "nominal"}
                    </span>
                    <Sparkline events={bEvts} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main area */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0">

            {/* Metrics bar */}
            <div
              className="flex gap-3 px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <MetricCard label="Events / min"   value={metrics.eventsPerMin}  color="var(--accent)" />
              <MetricCard label="Active Members"  value={metrics.activeMembers} color="#7c3aed" />
              <MetricCard label="Error Rate"      value={metrics.errorRate}     unit="%" color="#ef4444" />
              <MetricCard label="Avg Latency"     value={metrics.avgLatency}    unit="ms" color="#10b981" />
            </div>

            {/* Column header */}
            <div
              className="grid text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 shrink-0 select-none"
              style={{
                gridTemplateColumns: "80px 114px 88px 1fr 20px 68px",
                gap: "0.5rem",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--muted)",
              }}
            >
              <span>Time</span>
              <span>Branch</span>
              <span>Event</span>
              <span>Member</span>
              <span>St</span>
              <span>Latency</span>
            </div>

            {/* Event feed */}
            <div ref={feedContainerRef} className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
              {filteredEvents.length === 0 && (
                <div className="flex items-center justify-center h-32 text-xs font-mono" style={{ color: "var(--muted)" }}>
                  Waiting for events…
                </div>
              )}
              {filteredEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  isNew={event.id === latestId && isRunning}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selectedEvent && (
            <DetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </div>

        {/* ── Tech callout strip ── */}
        <div
          className="px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono shrink-0"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
        >
          {[
            ["Backend",   "Node.js · ExpressJS"],
            ["Messaging", "RabbitMQ"],
            ["Cloud",     "AWS EC2 · SNS · SES · Cognito"],
            ["Database",  "PostgreSQL"],
            ["Protocol",  "WebSocket · RBAC"],
          ].map(([k, v]) => (
            <span key={k}>
              <span style={{ color: "var(--muted)" }}>{k}: </span>
              <span style={{ color: "var(--accent)" }}>{v}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
