"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

const PURPOSES = ["Home Purchase", "Car Loan", "Personal Loan", "Business Expansion", "Debt Consolidation", "Education", "Medical"];

interface LoanResult {
  decision: string;
  probability: number;
  riskLevel: string;
  riskScore: number;
  maxLoanAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dti: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  summary: string;
}

const DECISION_COLORS: Record<string, string> = {
  APPROVED: "var(--green)",
  CONDITIONAL: "var(--amber)",
  DECLINED: "var(--red)",
};

export default function LoanGeniePage() {
  const [form, setForm] = useState({
    name: "Alex Johnson",
    age: "34",
    income: "85000",
    creditScore: "720",
    loanAmount: "25000",
    loanPurpose: "Home Purchase",
    employmentYears: "5",
    existingDebt: "800",
  });
  const [result, setResult] = useState<LoanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/loan-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          income: parseInt(form.income),
          creditScore: parseInt(form.creditScore),
          loanAmount: parseInt(form.loanAmount),
          employmentYears: parseInt(form.employmentYears),
          existingDebt: parseInt(form.existingDebt),
        }),
      });
      if (!res.ok) throw new Error("API error");
      setResult(await res.json());
    } catch {
      setError("Scoring failed. Make sure ANTHROPIC_API_KEY is set in .env.local");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", opts?: string[]) => (
    <div key={key}>
      <label style={{ color: "var(--muted)" }} className="text-xs font-mono block mb-1">{label}</label>
      {opts ? (
        <select
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
          className="w-full px-3 py-2 rounded text-sm"
        >
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
          className="w-full px-3 py-2 rounded text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      )}
    </div>
  );

  return (
    <>
      <Nav />
      <div className="pt-12" style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 style={{ color: "var(--text)" }} className="font-bold text-lg">💰 Loan Genie</h1>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono">Powered by Claude · instant risk assessment</p>
          </div>
          <Link href="/" style={{ color: "var(--muted)" }} className="text-xs hover:text-white">← Back</Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit}
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            className="rounded-xl p-6 space-y-4">
            <h2 style={{ color: "var(--text)" }} className="font-semibold text-sm mb-2">Application Details</h2>
            {field("Applicant Name", "name")}
            <div className="grid grid-cols-2 gap-3">
              {field("Age", "age", "number")}
              {field("Employment (years)", "employmentYears", "number")}
            </div>
            {field("Annual Income ($)", "income", "number")}
            {field("Credit Score (300–850)", "creditScore", "number")}
            {field("Loan Amount ($)", "loanAmount", "number")}
            {field("Loan Purpose", "loanPurpose", "text", PURPOSES)}
            {field("Monthly Existing Debt ($)", "existingDebt", "number")}
            <button
              type="submit"
              disabled={loading}
              style={{ background: "var(--accent)", color: "#050a14" }}
              className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "Analysing with Claude..." : "Score Application →"}
            </button>
            {error && <p style={{ color: "var(--red)" }} className="text-xs font-mono">{error}</p>}
          </form>

          {/* Result */}
          <div>
            {!result && !loading && (
              <div style={{ border: "1px dashed var(--border)" }} className="rounded-xl p-8 text-center h-full flex items-center justify-center">
                <div>
                  <div className="text-4xl mb-3">🤖</div>
                  <p style={{ color: "var(--muted)" }} className="text-sm">Submit the form to get an AI-powered risk assessment</p>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                className="rounded-xl p-8 text-center h-full flex items-center justify-center">
                <div>
                  <div className="text-4xl mb-3 animate-spin">⚙️</div>
                  <p style={{ color: "var(--muted)" }} className="text-sm font-mono">Claude is evaluating...</p>
                </div>
              </div>
            )}
            {result && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                className="rounded-xl p-6 space-y-4">
                {/* Decision banner */}
                <div
                  style={{ background: `${DECISION_COLORS[result.decision]}22`, border: `1px solid ${DECISION_COLORS[result.decision]}` }}
                  className="rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div style={{ color: DECISION_COLORS[result.decision] }} className="font-bold text-2xl">{result.decision}</div>
                    <div style={{ color: "var(--muted)" }} className="text-xs mt-0.5">Risk: {result.riskLevel}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ color: "var(--text)" }} className="font-mono text-xl">{result.probability}%</div>
                    <div style={{ color: "var(--muted)" }} className="text-xs">approval prob.</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  {[
                    ["Max Loan", `$${result.maxLoanAmount?.toLocaleString?.() ?? "—"}`],
                    ["APR", `${result.interestRate}%`],
                    ["Monthly Pmt", `$${result.monthlyPayment}`],
                    ["DTI", `${result.dti}%`],
                    ["Risk Score", `${result.riskScore}/100`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--surface2)" }} className="rounded p-2">
                      <div style={{ color: "var(--muted)" }}>{k}</div>
                      <div style={{ color: "var(--accent)" }} className="font-bold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Strengths / Concerns */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div style={{ color: "var(--green)" }} className="font-semibold mb-1">✓ Strengths</div>
                    {result.strengths.map((s, i) => (
                      <div key={i} style={{ color: "var(--muted)" }} className="mb-0.5">· {s}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ color: "var(--red)" }} className="font-semibold mb-1">⚠ Concerns</div>
                    {result.concerns.map((c, i) => (
                      <div key={i} style={{ color: "var(--muted)" }} className="mb-0.5">· {c}</div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <p style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }} className="text-xs pt-3">{result.summary}</p>

                {/* Recommendations */}
                <div>
                  <div style={{ color: "var(--accent)" }} className="text-xs font-semibold mb-1">Improvement Tips</div>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ color: "var(--muted)" }} className="text-xs mb-0.5">{i + 1}. {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
