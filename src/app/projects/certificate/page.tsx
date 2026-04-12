"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

type CertState = "pending" | "issued" | "active" | "expiring" | "expired" | "revoked" | "renewed";

interface Cert {
  id: string;
  domain: string;
  issuer: string;
  daysLeft: number;
  state: CertState;
  issuedAt: string;
  expiresAt: string;
  algorithm: string;
  keyBits: number;
}

const STATE_COLORS: Record<CertState, string> = {
  pending:  "#7c3aed",
  issued:   "#06b6d4",
  active:   "#10b981",
  expiring: "#f59e0b",
  expired:  "#ef4444",
  revoked:  "#ef4444",
  renewed:  "#a78bfa",
};

const STATE_TRANSITIONS: Record<CertState, CertState[]> = {
  pending:  ["issued", "revoked"],
  issued:   ["active", "revoked"],
  active:   ["expiring", "revoked"],
  expiring: ["expired", "renewed", "revoked"],
  expired:  ["pending"],
  revoked:  ["pending"],
  renewed:  ["active"],
};

const STATE_DESC: Record<CertState, string> = {
  pending:  "CSR submitted, awaiting CA validation",
  issued:   "Certificate issued by CA, awaiting deployment",
  active:   "Certificate deployed and serving traffic",
  expiring: "< 30 days until expiry — renewal recommended",
  expired:  "Certificate expired — site is insecure",
  revoked:  "Certificate revoked by CA or admin",
  renewed:  "New certificate issued, replacing expiring one",
};

const INITIAL_CERTS: Cert[] = [
  { id: "c1", domain: "api.example.com",     issuer: "Let's Encrypt R3",  daysLeft: 45,  state: "active",   issuedAt: "2024-11-01", expiresAt: "2025-05-01", algorithm: "ECDSA P-256", keyBits: 256 },
  { id: "c2", domain: "app.example.com",     issuer: "DigiCert TLS RSA",  daysLeft: 18,  state: "expiring", issuedAt: "2024-08-15", expiresAt: "2025-02-15", algorithm: "RSA",         keyBits: 2048 },
  { id: "c3", domain: "admin.example.com",   issuer: "Let's Encrypt R3",  daysLeft: 90,  state: "issued",   issuedAt: "2025-01-01", expiresAt: "2025-07-01", algorithm: "ECDSA P-384", keyBits: 384 },
  { id: "c4", domain: "legacy.example.com",  issuer: "GlobalSign Root",   daysLeft: 0,   state: "expired",  issuedAt: "2023-01-01", expiresAt: "2024-01-01", algorithm: "RSA",         keyBits: 2048 },
  { id: "c5", domain: "payments.example.com",issuer: "DigiCert EV",       daysLeft: 180, state: "active",   issuedAt: "2024-12-01", expiresAt: "2025-12-01", algorithm: "RSA",         keyBits: 4096 },
];

export default function CertificatePage() {
  const [certs, setCerts] = useState<Cert[]>(INITIAL_CERTS);
  const [selected, setSelected] = useState<Cert | null>(null);
  const [animating, setAnimating] = useState<string | null>(null);

  const transition = (certId: string, newState: CertState) => {
    setAnimating(certId);
    setTimeout(() => {
      setCerts((prev) => prev.map((c) => c.id === certId ? { ...c, state: newState } : c));
      setSelected((s) => s?.id === certId ? { ...s, state: newState } : s);
      setAnimating(null);
    }, 500);
  };

  const addNew = () => {
    const domains = ["staging.example.com", "dev.example.com", "cdn.example.com", "mail.example.com"];
    const d = domains[Math.floor(Math.random() * domains.length)];
    const newCert: Cert = {
      id: `c${Date.now()}`,
      domain: d,
      issuer: "Let's Encrypt R3",
      daysLeft: 90,
      state: "pending",
      issuedAt: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      algorithm: "ECDSA P-256",
      keyBits: 256,
    };
    setCerts((prev) => [...prev, newCert]);
    setSelected(newCert);
  };

  return (
    <>
      <Nav />
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">🔐 Certificate Lifecycle Management</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">Interactive PKI state machine · click transitions</p>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={addNew} style={{ background: "var(--accent)", color: "#050a14" }}
              className="text-xs font-mono px-3 py-1 rounded">
              + New CSR
            </button>
            <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* State machine diagram */}
          <div className="lg:col-span-2 rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 style={{ color: "var(--text)" }} className="text-sm font-semibold mb-4">Certificate State Machine</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {(Object.keys(STATE_COLORS) as CertState[]).map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs font-mono">
                  <div style={{ background: STATE_COLORS[s], width: 10, height: 10, borderRadius: "50%" }} />
                  <span style={{ color: "var(--muted)" }}>{s}</span>
                </div>
              ))}
            </div>

            {/* Certificate table */}
            <div className="space-y-2">
              {certs.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setSelected(cert)}
                  style={{
                    background: selected?.id === cert.id ? "var(--surface2)" : "transparent",
                    border: `1px solid ${selected?.id === cert.id ? STATE_COLORS[cert.state] : "var(--border)"}`,
                    opacity: animating === cert.id ? 0.5 : 1,
                    transition: "all 0.3s",
                  }}
                  className="rounded-lg px-4 py-3 cursor-pointer flex items-center gap-4"
                >
                  <div
                    style={{ background: STATE_COLORS[cert.state], width: 10, height: 10, borderRadius: "50%", flexShrink: 0 }}
                    className={animating === cert.id ? "animate-pulse" : ""}
                  />
                  <div className="flex-1 min-w-0">
                    <div style={{ color: "var(--text)" }} className="text-sm font-mono truncate">{cert.domain}</div>
                    <div style={{ color: "var(--muted)" }} className="text-xs">{cert.issuer}</div>
                  </div>
                  <div className="text-right">
                    <span
                      style={{ color: STATE_COLORS[cert.state], border: `1px solid ${STATE_COLORS[cert.state]}` }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    >
                      {cert.state}
                    </span>
                    <div style={{ color: cert.daysLeft < 30 ? "var(--amber)" : "var(--muted)" }}
                      className="text-xs font-mono mt-1">
                      {cert.daysLeft}d left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <div style={{ background: "var(--surface)", border: `1px solid ${STATE_COLORS[selected.state]}` }}
                className="rounded-xl p-5">
                <div style={{ color: STATE_COLORS[selected.state] }} className="font-bold text-sm mb-1">
                  {selected.domain}
                </div>
                <div style={{ color: "var(--muted)" }} className="text-xs mb-4">{STATE_DESC[selected.state]}</div>

                <div className="space-y-2 text-xs font-mono mb-4">
                  {[
                    ["State", selected.state],
                    ["Issuer", selected.issuer],
                    ["Algorithm", selected.algorithm],
                    ["Key Size", `${selected.keyBits} bits`],
                    ["Issued", selected.issuedAt],
                    ["Expires", selected.expiresAt],
                    ["Days Left", `${selected.daysLeft}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>{k}</span>
                      <span style={{ color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ color: "var(--muted)" }} className="text-xs font-mono mb-2">Available Transitions</div>
                  <div className="space-y-2">
                    {STATE_TRANSITIONS[selected.state].map((next) => (
                      <button
                        key={next}
                        onClick={() => transition(selected.id, next)}
                        style={{ borderColor: STATE_COLORS[next], color: STATE_COLORS[next] }}
                        className="w-full text-xs font-mono py-1.5 rounded border hover:opacity-80 transition-opacity"
                      >
                        → {next}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ border: "1px dashed var(--border)" }}
                className="rounded-xl p-6 text-center flex items-center justify-center h-48">
                <p style={{ color: "var(--muted)" }} className="text-xs">Select a certificate to see details and trigger transitions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
