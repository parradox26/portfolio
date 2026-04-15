"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventType =
  | "BOOK_CHECKOUT"
  | "BOOK_RETURN"
  | "GATE_ENTRY"
  | "GATE_EXIT"
  | "KIOSK_ERROR"
  | "MEMBER_REGISTER";

export interface LibEvent {
  id: string;
  type: EventType;
  branch: string;
  kiosk_id: string;
  member_id: string;
  book_id?: string;
  timestamp: Date;
  status: "success" | "warning" | "error";
  latency_ms: number;
  payload: Record<string, string>;
}

export interface Metrics {
  eventsPerMin: number;
  activeMembers: number;
  errorRate: number;
  avgLatency: number;
}

// ── Simulation data ───────────────────────────────────────────────────────────

export const BRANCHES = [
  "Sector 18 Noida",
  "CP New Delhi",
  "Koramangala Bangalore",
  "Banjara Hills Hyderabad",
  "Salt Lake Kolkata",
] as const;

export const KIOSK_COUNTS: Record<string, number> = {
  "Sector 18 Noida": 4,
  "CP New Delhi": 6,
  "Koramangala Bangalore": 5,
  "Banjara Hills Hyderabad": 3,
  "Salt Lake Kolkata": 4,
};

const KIOSK_IDS: Record<string, string[]> = {
  "Sector 18 Noida":        ["KSK-01", "KSK-02", "KSK-03", "KSK-04"],
  "CP New Delhi":           ["KSK-01", "KSK-02", "KSK-03", "KSK-04", "KSK-05", "KSK-06"],
  "Koramangala Bangalore":  ["KSK-01", "KSK-02", "KSK-03", "KSK-04", "KSK-05"],
  "Banjara Hills Hyderabad":["KSK-01", "KSK-02", "KSK-03"],
  "Salt Lake Kolkata":      ["KSK-01", "KSK-02", "KSK-03", "KSK-04"],
};

const EVENT_WEIGHTS: [EventType, number][] = [
  ["BOOK_CHECKOUT",   35],
  ["BOOK_RETURN",     25],
  ["GATE_ENTRY",      20],
  ["GATE_EXIT",       10],
  ["KIOSK_ERROR",      5],
  ["MEMBER_REGISTER",  5],
];

const MAX_EVENTS = 200;

// ── Helpers ───────────────────────────────────────────────────────────────────

function weightedPick<T>(weights: [T, number][]): T {
  let r = Math.random() * weights.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of weights) { r -= w; if (r <= 0) return v; }
  return weights[weights.length - 1][0];
}

function ri(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function generateEvent(): LibEvent {
  const branch = BRANCHES[ri(0, BRANCHES.length - 1)];
  const kiosks = KIOSK_IDS[branch];
  const type = weightedPick(EVENT_WEIGHTS);
  const latency_ms = ri(8, 240);
  const hasBook = type === "BOOK_CHECKOUT" || type === "BOOK_RETURN";

  const status: LibEvent["status"] =
    type === "KIOSK_ERROR" ? "error" :
    latency_ms > 180      ? "warning" : "success";

  const payload: Record<string, string> = {
    branch_code: branch.toUpperCase().replace(/\s+/g, "_").slice(0, 12),
    firmware:    `v2.${ri(0, 9)}.${ri(0, 19)}`,
    session_id:  `SES-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
  if (type === "KIOSK_ERROR")     payload.error_code = `E${ri(100, 999)}`;
  if (type === "MEMBER_REGISTER") payload.plan = ["Basic", "Premium", "Student"][ri(0, 2)];

  return {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    branch,
    kiosk_id:  kiosks[ri(0, kiosks.length - 1)],
    member_id: `MBR-${ri(1000, 9999)}`,
    book_id:   hasBook ? `ISBN-978${ri(100_000_000, 999_999_999)}` : undefined,
    timestamp: new Date(),
    status,
    latency_ms,
    payload,
  };
}

function computeMetrics(events: LibEvent[]): Metrics {
  const now = Date.now();
  const last60s = events.filter(e => now - e.timestamp.getTime() < 60_000);
  const last5m  = events.filter(e => now - e.timestamp.getTime() < 300_000);
  const errors  = last5m.filter(e => e.type === "KIOSK_ERROR").length;
  return {
    eventsPerMin:  last60s.length,
    activeMembers: new Set(last5m.map(e => e.member_id)).size,
    errorRate:     last5m.length ? parseFloat(((errors / last5m.length) * 100).toFixed(1)) : 0,
    avgLatency:    last5m.length ? Math.round(last5m.reduce((s, e) => s + e.latency_ms, 0) / last5m.length) : 0,
  };
}

// ── Seed events (shown before the stream starts) ──────────────────────────────

function generateSeedEvents(count = 30): LibEvent[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    // Spread evenly over the last 4 minutes, most recent last
    const ageMs = ((count - i) / count) * 4 * 60 * 1000;
    const ev = generateEvent();
    ev.timestamp = new Date(now - ageMs);
    ev.id = `seed-${i}-${Math.random().toString(36).slice(2, 8)}`;
    return ev;
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEventStream() {
  const [events, setEvents] = useState<LibEvent[]>(() => generateSeedEvents(30));
  const [isRunning, setIsRunning] = useState(true);
  const timerRef   = useRef<number | null>(null);
  const runningRef = useRef(true);

  const scheduleNext = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      if (!runningRef.current) return;
      const ev = generateEvent();
      setEvents(prev => [...prev, ev].slice(-MAX_EVENTS));
      scheduleNext();
    }, 800 + Math.random() * 1200);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  // Refresh metrics on the rolling window every 10 s even without new events
  useEffect(() => {
    const id = setInterval(() => setEvents(prev => [...prev]), 10_000);
    return () => clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    const next = !runningRef.current;
    runningRef.current = next;
    setIsRunning(next);
    if (next) scheduleNext();
    else if (timerRef.current) clearTimeout(timerRef.current);
  }, [scheduleNext]);

  const metrics = useMemo(() => computeMetrics(events), [events]);

  return { events, metrics, isRunning, toggle };
}
