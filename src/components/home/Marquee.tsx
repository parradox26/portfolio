"use client";

interface Props {
  items: string[];
  speed?: number; /** seconds for one full loop */
  separator?: string;
}

export default function Marquee({ items, speed = 28, separator = "·" }: Props) {
  // Duplicate items so the loop appears seamless
  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          width: "max-content",
          animation: `marquee-scroll ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "2.5rem",
            }}
          >
            {item}
            <span style={{ color: "var(--accent)", opacity: 0.5 }}>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
