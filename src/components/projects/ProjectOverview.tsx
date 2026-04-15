interface Props {
  paragraphs: string[];
}

export default function ProjectOverview({ paragraphs }: Props) {
  return (
    <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p
          className="text-xs tracking-widest uppercase mb-6 font-mono"
          style={{ color: "var(--accent)" }}
        >
          About the Project
        </p>
        <div className="flex flex-col gap-6">
          {paragraphs.map((para, i) => (
            <p key={i} style={{ color: "var(--muted)", lineHeight: 1.85 }} className="text-base sm:text-lg">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
