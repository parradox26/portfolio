"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects/library", label: "Library SaaS" },
  { href: "/projects/cubesat", label: "CubeSat" },
  { href: "/projects/loan-genie", label: "Loan Genie" },
  { href: "/projects/golden-batch", label: "Golden Batch" },
  { href: "/projects/city-iot", label: "City IoT" },
  { href: "/projects/demand-forecasting", label: "Forecasting" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav
      style={{ background: "rgba(5,10,20,0.85)", borderBottom: "1px solid var(--border)" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-12 overflow-x-auto">
        <span
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-sm font-bold mr-4 shrink-0"
        >
          {"<Portfolio/>"}
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: pathname === l.href ? "var(--accent)" : "var(--muted)",
              borderBottom: pathname === l.href ? "2px solid var(--accent)" : "2px solid transparent",
            }}
            className="text-xs px-3 py-1 shrink-0 hover:text-white transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
