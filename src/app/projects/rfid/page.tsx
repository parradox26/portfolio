"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

type ItemStatus = "in_stock" | "checked_out" | "missing" | "quarantine";

interface WarehouseItem {
  id: string;
  row: number;
  col: number;
  sku: string;
  name: string;
  status: ItemStatus;
  lastScan: number;
  synced: boolean;
}

interface ScanEvent {
  id: string;
  itemId: string;
  sku: string;
  action: string;
  ts: number;
  synced: boolean;
}

const ITEM_NAMES = ["Widget A", "Gear Box", "Motor Unit", "Cable Set", "Sensor Pack", "Filter Kit", "Valve Assy", "Pump Head", "Drive Unit", "Panel", "Frame", "Bracket"];
const STATUS_COLORS: Record<ItemStatus, string> = {
  in_stock:    "#10b981",
  checked_out: "#00d4ff",
  missing:     "#ef4444",
  quarantine:  "#f59e0b",
};

const ROWS = 8, COLS = 10;

function makeGrid(): WarehouseItem[] {
  const statuses: ItemStatus[] = ["in_stock", "in_stock", "in_stock", "in_stock", "checked_out", "missing", "quarantine"];
  return Array.from({ length: ROWS * COLS }, (_, i) => ({
    id: `item-${i}`,
    row: Math.floor(i / COLS),
    col: i % COLS,
    sku: `SKU-${String(1000 + i).padStart(4, "0")}`,
    name: ITEM_NAMES[i % ITEM_NAMES.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastScan: Date.now() - Math.random() * 3600000,
    synced: true,
  }));
}

export default function RFIDPage() {
  const [grid, setGrid] = useState<WarehouseItem[]>([]);
  const [queue, setQueue] = useState<ScanEvent[]>([]);
  const [synced, setSynced] = useState<ScanEvent[]>([]);
  const [online, setOnline] = useState(true);
  const [selected, setSelected] = useState<WarehouseItem | null>(null);
  const [scanning, setScanning] = useState(false);
  const scanRef = useRef(false);

  useEffect(() => {
    setGrid(makeGrid());
  }, []);

  // Auto scan simulation
  useEffect(() => {
    scanRef.current = scanning;
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      if (!scanRef.current) return;
      setGrid((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const item = prev[idx];
        const actions: ItemStatus[] = ["in_stock", "checked_out"];
        const newStatus = actions[Math.floor(Math.random() * actions.length)];
        const updated = prev.map((it, i) => i === idx ? { ...it, status: newStatus, lastScan: Date.now(), synced: false } : it);
        const ev: ScanEvent = {
          id: `ev-${Date.now()}`,
          itemId: item.id,
          sku: item.sku,
          action: newStatus === "checked_out" ? "CHECKOUT" : "RETURN",
          ts: Date.now(),
          synced: false,
        };
        setQueue((q) => [...q, ev]);
        return updated;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [scanning]);

  // Auto-sync when online
  useEffect(() => {
    if (!online || queue.length === 0) return;
    const timeout = setTimeout(() => {
      setSynced((s) => [...s, ...queue]);
      setQueue([]);
      setGrid((prev) => prev.map((it) => ({ ...it, synced: true })));
    }, 800);
    return () => clearTimeout(timeout);
  }, [online, queue]);

  const stats = {
    total: grid.length,
    in_stock: grid.filter((i) => i.status === "in_stock").length,
    checked_out: grid.filter((i) => i.status === "checked_out").length,
    missing: grid.filter((i) => i.status === "missing").length,
    quarantine: grid.filter((i) => i.status === "quarantine").length,
    unsynced: grid.filter((i) => !i.synced).length,
  };

  return (
    <>
      <Nav />
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">📦 RFID Warehouse Management System</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">Scans queue offline · auto-sync on reconnect</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setOnline((o) => !o)}
              style={{ background: online ? "var(--green)" : "var(--red)", color: "#fff" }}
              className="text-xs font-mono px-3 py-1 rounded"
            >
              {online ? "● Online" : "○ Offline"}
            </button>
            <button
              onClick={() => setScanning((s) => !s)}
              style={{ background: scanning ? "var(--amber)" : "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              className="text-xs font-mono px-3 py-1 rounded"
            >
              {scanning ? "⏸ Pause RFID" : "▶ Start RFID"}
            </button>
            <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
            {[
              { label: "Total", value: stats.total, color: "var(--text)" },
              { label: "In Stock", value: stats.in_stock, color: STATUS_COLORS.in_stock },
              { label: "Checked Out", value: stats.checked_out, color: STATUS_COLORS.checked_out },
              { label: "Missing", value: stats.missing, color: STATUS_COLORS.missing },
              { label: "Quarantine", value: stats.quarantine, color: STATUS_COLORS.quarantine },
              { label: "Unsynced", value: stats.unsynced, color: !online && stats.unsynced > 0 ? "var(--amber)" : "var(--muted)" },
            ].map((s) => (
              <div key={s.label}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-lg p-3 text-center">
                <div style={{ color: s.color }} className="font-bold font-mono text-xl">{s.value}</div>
                <div style={{ color: "var(--muted)" }} className="text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Offline banner */}
          {!online && queue.length > 0 && (
            <div style={{ background: "#f59e0b22", border: "1px solid var(--amber)" }}
              className="rounded-lg px-4 py-2 mb-4 text-xs font-mono flex items-center gap-2">
              <span style={{ color: "var(--amber)" }}>⚠ OFFLINE MODE</span>
              <span style={{ color: "var(--muted)" }}>
                {queue.length} scan events queued locally (IndexedDB) — will sync on reconnect
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Grid */}
            <div className="lg:col-span-3">
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-4">
                <div style={{ color: "var(--muted)" }} className="text-xs font-mono mb-3">
                  Warehouse Floor Plan — {ROWS} rows × {COLS} bays
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                  {grid.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelected(item)}
                      title={`${item.sku} — ${item.status}`}
                      style={{
                        background: STATUS_COLORS[item.status],
                        opacity: item.synced ? 1 : 0.6,
                        border: selected?.id === item.id ? "2px solid white" : "2px solid transparent",
                        boxShadow: !item.synced ? "0 0 6px rgba(245,158,11,0.6)" : "none",
                      }}
                      className="aspect-square rounded cursor-pointer transition-all hover:scale-110"
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-mono">
                  {Object.entries(STATUS_COLORS).map(([s, c]) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div style={{ background: c, width: 8, height: 8, borderRadius: 2 }} />
                      <span style={{ color: "var(--muted)" }}>{s.replace("_", " ")}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: 8, height: 8, borderRadius: 2, border: "1px solid var(--amber)", opacity: 0.6, background: "var(--amber)" }} />
                    <span style={{ color: "var(--muted)" }}>unsynced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">
              {/* Selected item */}
              {selected && (
                <div style={{ background: "var(--surface)", border: `1px solid ${STATUS_COLORS[selected.status]}` }}
                  className="rounded-xl p-3 text-xs font-mono">
                  <div style={{ color: STATUS_COLORS[selected.status] }} className="font-bold mb-2">{selected.sku}</div>
                  <div className="space-y-1" style={{ color: "var(--muted)" }}>
                    <div>Name: <span style={{ color: "var(--text)" }}>{selected.name}</span></div>
                    <div>Status: <span style={{ color: STATUS_COLORS[selected.status] }}>{selected.status}</span></div>
                    <div>Row: <span style={{ color: "var(--text)" }}>{selected.row + 1}</span></div>
                    <div>Bay: <span style={{ color: "var(--text)" }}>{selected.col + 1}</span></div>
                    <div>Synced: <span style={{ color: selected.synced ? "var(--green)" : "var(--amber)" }}>{selected.synced ? "yes" : "pending"}</span></div>
                    <div>Last scan: <span style={{ color: "var(--text)" }}>{new Date(selected.lastScan).toLocaleTimeString()}</span></div>
                  </div>
                </div>
              )}

              {/* Scan queue */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: "var(--text)" }} className="text-xs font-semibold">Scan Queue</span>
                  <span style={{ color: queue.length > 0 ? "var(--amber)" : "var(--green)" }} className="text-[10px] font-mono">
                    {queue.length} pending
                  </span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {[...queue].reverse().slice(0, 20).map((ev) => (
                    <div key={ev.id}
                      style={{ background: "var(--surface2)", color: "var(--muted)" }}
                      className="text-[10px] font-mono px-2 py-1 rounded flex justify-between">
                      <span>{ev.sku}</span>
                      <span style={{ color: ev.action === "CHECKOUT" ? "var(--accent)" : "var(--green)" }}>{ev.action}</span>
                    </div>
                  ))}
                  {synced.slice(-5).map((ev) => (
                    <div key={ev.id}
                      style={{ background: "var(--surface2)", color: "var(--muted)", opacity: 0.5 }}
                      className="text-[10px] font-mono px-2 py-1 rounded flex justify-between">
                      <span>{ev.sku}</span>
                      <span style={{ color: "var(--green)" }}>✓ synced</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
