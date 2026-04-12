import Link from "next/link";

interface Props {
  href: string;
  title: string;
  description: string;
  tags: string[];
  status?: "live" | "demo" | "sim";
  icon: string;
}

const statusColors = {
  live: "var(--green)",
  demo: "var(--accent)",
  sim: "var(--amber)",
};

export default function ProjectCard({ href, title, description, tags, status = "demo", icon }: Props) {
  return (
    <Link href={href} className="group block">
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          transition: "border-color 0.2s, transform 0.2s",
        }}
        className="rounded-xl p-5 h-full flex flex-col gap-3 group-hover:scale-[1.02]"
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
      >
        <div className="flex items-start justify-between">
          <span className="text-3xl">{icon}</span>
          <span
            style={{ color: statusColors[status], border: `1px solid ${statusColors[status]}` }}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase"
          >
            {status}
          </span>
        </div>
        <h3 style={{ color: "var(--text)" }} className="font-semibold text-base leading-tight">
          {title}
        </h3>
        <p style={{ color: "var(--muted)" }} className="text-sm leading-relaxed flex-1">
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {tags.map((t) => (
            <span
              key={t}
              style={{ background: "var(--surface2)", color: "var(--muted)" }}
              className="text-[10px] font-mono px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
