"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EVENT_TYPES = ["checkout", "return", "reservation", "overdue", "renewal", "new_member"] as const;
type EventType = (typeof EVENT_TYPES)[number];

const EVENT_COLORS: Record<EventType, string> = {
  checkout: "#00d4ff",
  return: "#10b981",
  reservation: "#7c3aed",
  overdue: "#ef4444",
  renewal: "#f59e0b",
  new_member: "#a78bfa",
};

const BOOKS = [
  "The Pragmatic Programmer", "Clean Code", "Designing Data-Intensive Applications",
  "The Algorithm Design Manual", "Structure & Interpretation of Computer Programs",
  "You Don't Know JS", "Refactoring", "Domain-Driven Design", "The Mythical Man-Month",
  "Introduction to Algorithms", "Deep Learning", "Pattern Recognition & Machine Learning",
];

const MEMBERS = ["Alice K.", "Bob M.", "Carol L.", "Dave P.", "Eva R.", "Frank S.", "Grace T.", "Hank U."];

function randomEvent(): { type: EventType; book: string; member: string; id: number } {
  return {
    type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
    book: BOOKS[Math.floor(Math.random() * BOOKS.length)],
    member: MEMBERS[Math.floor(Math.random() * MEMBERS.length)],
    id: Date.now() + Math.random(),
  };
}

type ChartPoint = { time: string; checkouts: number; returns: number; overdues: number };

export default function LibraryPage() {
  const [events, setEvents] = useState<ReturnType<typeof randomEvent>[]>([]);
  const [stats, setStats] = useState({ checkouts: 0, returns: 0, overdue: 0, members: 0 });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(true);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    const tick = () => {
      if (!runningRef.current) return;
      const ev = randomEvent();
      setEvents((prev) => [ev, ...prev].slice(0, 60));
      setStats((s) => ({
        checkouts: s.checkouts + (ev.type === "checkout" ? 1 : 0),
        returns: s.returns + (ev.type === "return" ? 1 : 0),
        overdue: s.overdue + (ev.type === "overdue" ? 1 : 0),
        members: s.members + (ev.type === "new_member" ? 1 : 0),
      }));
      setChartData((prev) => {
        const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const last = prev[prev.length - 1];
        if (last && last.time === now) {
          return prev.map((p, i) =>
            i === prev.length - 1
              ? {
                  ...p,
                  checkouts: p.checkouts + (ev.type === "checkout" ? 1 : 0),
                  returns: p.returns + (ev.type === "return" ? 1 : 0),
                  overdues: p.overdues + (ev.type === "overdue" ? 1 : 0),
                }
              : p
          );
        }
        return [
          ...prev.slice(-29),
          {
            time: now,
            checkouts: ev.type === "checkout" ? 1 : 0,
            returns: ev.type === "return" ? 1 : 0,
            overdues: ev.type === "overdue" ? 1 : 0,
          },
        ];
      });
    };
    const interval = setInterval(tick, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Nav />
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* Header */}
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">📚 Smart Library SaaS</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">
              WebSocket event stream · real-time stats · 0.8s tick
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              style={{ background: running ? "var(--red)" : "var(--green)", color: "#fff" }}
              className="text-xs font-mono px-3 py-1 rounded"
            >
              {running ? "⏸ Pause" : "▶ Resume"}
            </button>
            <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Checkouts Today", value: stats.checkouts, color: "var(--accent)" },
              { label: "Returns", value: stats.returns, color: "var(--green)" },
              { label: "Overdue Alerts", value: stats.overdue, color: "var(--red)" },
              { label: "New Members", value: stats.members, color: "#a78bfa" },
            ].map((s) => (
              <div key={s.label}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-4">
                <div style={{ color: s.color }} className="text-3xl font-bold font-mono">{s.value}</div>
                <div style={{ color: "var(--muted)" }} className="text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4">Events over time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 11 }}
                />
                <Area type="monotone" dataKey="checkouts" stroke="#00d4ff" fill="url(#gc)" strokeWidth={2} />
                <Area type="monotone" dataKey="returns" stroke="#10b981" fill="url(#gr)" strokeWidth={2} />
                <Area type="monotone" dataKey="overdues" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Live event feed */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            className="rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: running ? "var(--green)" : "var(--muted)" }} className="text-xs font-mono">
                {running ? "● LIVE" : "● PAUSED"}
              </span>
              <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold">Event Stream</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5" style={{ maxHeight: 260 }}>
              {events.map((ev) => (
                <div key={ev.id}
                  style={{ background: "var(--surface2)", borderLeft: `3px solid ${EVENT_COLORS[ev.type]}` }}
                  className="px-3 py-1.5 rounded text-xs flex items-start gap-2">
                  <span style={{ color: EVENT_COLORS[ev.type] }} className="font-mono uppercase shrink-0 text-[10px] pt-0.5">
                    {ev.type}
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--text)" }}>{ev.member}</span> · {ev.book}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
