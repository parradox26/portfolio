import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface Props {
  prev?: NavItem;
  next?: NavItem;
}

export default function ProjectNav({ prev, next }: Props) {
  return (
    <footer
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
      className="px-6 py-10"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={prev.href}
            style={{ border: "1px solid var(--border)", background: "var(--bg)" }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl group hover:border-[color:var(--accent)] transition-colors"
          >
            <span style={{ color: "var(--muted)" }} className="text-sm group-hover:text-white transition-colors">←</span>
            <div>
              <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono uppercase tracking-widest">Previous</div>
              <div style={{ color: "var(--text)" }} className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{prev.icon}</span>
                <span>{prev.name}</span>
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        <Link
          href="/#projects"
          style={{ color: "var(--muted)" }}
          className="text-xs font-mono hover:text-white transition-colors hidden sm:block"
        >
          All Projects
        </Link>

        {next ? (
          <Link
            href={next.href}
            style={{ border: "1px solid var(--border)", background: "var(--bg)" }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl group hover:border-[color:var(--accent)] transition-colors text-right"
          >
            <div>
              <div style={{ color: "var(--muted)" }} className="text-[10px] font-mono uppercase tracking-widest">Next</div>
              <div style={{ color: "var(--text)" }} className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{next.icon}</span>
                <span>{next.name}</span>
              </div>
            </div>
            <span style={{ color: "var(--muted)" }} className="text-sm group-hover:text-white transition-colors">→</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </footer>
  );
}
