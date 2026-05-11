"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    let mx = -300, my = -300, rx = -300, ry = -300;
    let hovering = false;
    let visible  = false;
    let rafId: number;

    const setVisible = (v: boolean) => {
      visible = v;
      dot.style.opacity  = v ? "1" : "0";
      ring.style.opacity = v ? "1" : "0";
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const attachHover = () => {
      document.querySelectorAll<Element>("a, button, [data-cursor]").forEach(el => {
        el.addEventListener("mouseenter", () => { hovering = true; });
        el.addEventListener("mouseleave", () => { hovering = false; });
      });
    };

    const loop = () => {
      dot.style.left = `${mx}px`;
      dot.style.top  = `${my}px`;

      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left      = `${rx}px`;
      ring.style.top       = `${ry}px`;
      ring.style.width     = hovering ? "56px" : "36px";
      ring.style.height    = hovering ? "56px" : "36px";
      ring.style.borderColor = hovering ? "var(--accent)" : "rgba(0,212,255,0.35)";

      rafId = requestAnimationFrame(loop);
    };

    setVisible(false);
    window.addEventListener("mousemove",   onMove,  { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    rafId = requestAnimationFrame(loop);
    attachHover();

    const mutObs = new MutationObserver(attachHover);
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove",   onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId);
      mutObs.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed", zIndex: 9999,
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          transition: "opacity 0.2s",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed", zIndex: 9998,
          width: 36, height: 36, borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.35)",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s ease, height 0.25s ease, border-color 0.2s, opacity 0.2s",
        }}
      />
    </>
  );
}
