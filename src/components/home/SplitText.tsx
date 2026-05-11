"use client";
import { useEffect, useRef, useState, createElement } from "react";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface Props {
  text: string;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
  /** ms delay before the first word starts */
  delay?: number;
  /** ms stagger between each word */
  stagger?: number;
  /** animation duration in seconds */
  duration?: number;
}

export default function SplitText({
  text,
  as = "span",
  className,
  style,
  delay   = 0,
  stagger = 65,
  duration = 0.85,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShow(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  const inner = words.map((word, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        marginRight: "0.28em",
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: show ? "translateY(0) rotate(0deg)" : "translateY(110%) rotate(3deg)",
          opacity: show ? 1 : 0,
          transition: `transform ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay + i * stagger}ms,
                       opacity   ${duration * 0.55}s ease                  ${delay + i * stagger}ms`,
        }}
      >
        {word}
      </span>
    </span>
  ));

  return createElement(as, { ref: containerRef, className, style: { display: "block", ...style } }, inner);
}
