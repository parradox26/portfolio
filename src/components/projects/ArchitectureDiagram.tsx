"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import type { ArchNode, ArchEdge, NodeType } from "@/lib/data/portfolio";

// Visual config per node type
const NODE_STYLE: Record<NodeType, { stroke: string; fill: string; glow?: string; dash?: boolean }> = {
  device:   { stroke: "#00d4ff", fill: "rgba(0,212,255,0.07)"   },
  service:  { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.07)"  },
  frontend: { stroke: "#10b981", fill: "rgba(16,185,129,0.07)"  },
  database: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.07)"  },
  queue:    { stroke: "#f97316", fill: "rgba(249,115,22,0.07)"  },
  ai:       { stroke: "#06b6d4", fill: "rgba(6,182,212,0.08)", glow: "#06b6d4" },
  ml:       { stroke: "#ec4899", fill: "rgba(236,72,153,0.07)", glow: "#ec4899" },
  cloud:    { stroke: "#94a3b8", fill: "rgba(148,163,184,0.05)", dash: true },
};

const NODE_W = 112;
const NODE_H = 42;

// Get the edge attachment point on the node's border (side closest to target)
function edgePoint(node: ArchNode, other: ArchNode): [number, number] {
  const cx = node.x + NODE_W / 2;
  const cy = node.y + NODE_H / 2;
  const tx = other.x + NODE_W / 2;
  const ty = other.y + NODE_H / 2;
  const dx = tx - cx;
  const dy = ty - cy;

  // Determine which edge to exit from
  const scaleX = Math.abs(dx) > 0 ? (NODE_W / 2) / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 0 ? (NODE_H / 2) / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);

  return [cx + dx * scale, cy + dy * scale];
}

interface Props {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export default function ArchitectureDiagram({ nodes, edges }: Props) {
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const pulseRef = useRef<number>(0);

  // Idle pulse for ai/ml nodes
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    pulseRef.current = id as unknown as number;
    return () => clearInterval(id);
  }, [inView]);

  // Compute SVG bounding box
  const { viewW, viewH } = useMemo(() => {
    const maxX = Math.max(...nodes.map((n) => n.x)) + NODE_W + 20;
    const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_H + 20;
    return { viewW: Math.max(maxX, 600), viewH: Math.max(maxY, 300) };
  }, [nodes]);

  // Node lookup for edge routing
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  // Which edges connect to the hovered node
  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return new Set<number>();
    return new Set(
      edges
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.from === hoveredNode || e.to === hoveredNode)
        .map(({ i }) => i)
    );
  }, [hoveredNode, edges]);

  return (
    <section style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest uppercase mb-2 font-mono" style={{ color: "var(--accent)" }}>
          System Architecture
        </p>
        <p className="text-xs font-mono mb-8" style={{ color: "var(--muted)" }}>
          Hover a node to highlight connections
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(Object.entries(NODE_STYLE) as [NodeType, typeof NODE_STYLE[NodeType]][]).map(([type, s]) => (
            <div key={type} className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "var(--muted)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.fill, border: `1px solid ${s.stroke}`, borderStyle: s.dash ? "dashed" : "solid" }} />
              {type}
            </div>
          ))}
        </div>

        {/* Diagram — scrollable on mobile */}
        <div ref={sectionRef} className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            style={{ minWidth: viewW, width: "100%", display: "block" }}
            height={viewH}
          >
            <defs>
              {/* Arrow markers */}
              {(Object.entries(NODE_STYLE) as [NodeType, typeof NODE_STYLE[NodeType]][]).map(([type, s]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L8,3 L0,6 Z" fill={s.stroke} opacity="0.7" />
                </marker>
              ))}
              <marker id="arrow-dim" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="rgba(148,163,184,0.2)" />
              </marker>
              <marker id="arrow-hi" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="#00d4ff" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              const src = nodeMap[edge.from];
              const dst = nodeMap[edge.to];
              if (!src || !dst) return null;

              const [x1, y1] = edgePoint(src, dst);
              const [x2, y2] = edgePoint(dst, src);

              const isConnected = connectedEdges.has(i);
              const isDimmed = hoveredNode !== null && !isConnected;

              // Use source node type for color
              const srcStyle = NODE_STYLE[src.type];
              const strokeColor = isDimmed ? "rgba(148,163,184,0.15)" : isConnected ? "#00d4ff" : `${srcStyle.stroke}55`;
              const markerEnd = isDimmed ? "url(#arrow-dim)" : isConnected ? "url(#arrow-hi)" : `url(#arrow-${src.type})`;

              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              // Slight curve via control point
              const cpx = mx + (y2 - y1) * 0.08;
              const cpy = my - (x2 - x1) * 0.08;

              // Animation: stroke-dashoffset
              const pathLen = Math.hypot(x2 - x1, y2 - y1) * 1.05;
              const dashStyle = inView
                ? {}
                : { strokeDasharray: pathLen, strokeDashoffset: pathLen };

              return (
                <g key={i}>
                  <path
                    d={`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isConnected ? 1.8 : 1}
                    markerEnd={markerEnd}
                    style={{
                      ...dashStyle,
                      transition: inView
                        ? `stroke-dashoffset 0.6s ease ${nodes.length * 0.08 + i * 0.04}s, stroke 0.2s, stroke-width 0.2s`
                        : "none",
                    }}
                  />
                  {/* Edge label */}
                  {!isDimmed && (
                    <text
                      x={cpx}
                      y={cpy - 4}
                      textAnchor="middle"
                      style={{
                        fill: isConnected ? "#00d4ff" : "rgba(148,163,184,0.55)",
                        fontSize: 9,
                        fontFamily: "var(--font-geist-mono)",
                        transition: "fill 0.2s",
                      }}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const s = NODE_STYLE[node.type];
              const isDimmed = hoveredNode !== null && hoveredNode !== node.id;
              const isHovered = hoveredNode === node.id;
              const isPulse = (node.type === "ai" || node.type === "ml") && inView;
              const pulseAlpha = isPulse ? 0.12 + 0.06 * Math.sin(tick * 0.8 + i) : 0;

              return (
                <g
                  key={node.id}
                  style={{
                    opacity: inView ? (isDimmed ? 0.3 : 1) : 0,
                    transform: inView ? "scale(1)" : "scale(0.85)",
                    transformOrigin: `${node.x + NODE_W / 2}px ${node.y + NODE_H / 2}px`,
                    transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glow for ai/ml nodes */}
                  {s.glow && (
                    <rect
                      x={node.x - 4}
                      y={node.y - 4}
                      width={NODE_W + 8}
                      height={NODE_H + 8}
                      rx={10}
                      fill={s.glow}
                      opacity={pulseAlpha}
                      style={{ transition: "opacity 0.6s" }}
                    />
                  )}

                  {/* Database cylinder */}
                  {node.type === "database" ? (
                    <g>
                      <rect x={node.x} y={node.y + 8} width={NODE_W} height={NODE_H - 8} fill={s.fill} stroke={s.stroke} strokeWidth={isHovered ? 1.8 : 1} rx={4} />
                      <ellipse cx={node.x + NODE_W / 2} cy={node.y + 8} rx={NODE_W / 2} ry={8} fill={s.fill} stroke={s.stroke} strokeWidth={isHovered ? 1.8 : 1} />
                      <ellipse cx={node.x + NODE_W / 2} cy={node.y + 8} rx={NODE_W / 2} ry={8} fill={s.stroke} opacity={0.12} />
                    </g>
                  ) : (
                    <rect
                      x={node.x}
                      y={node.y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={6}
                      fill={s.fill}
                      stroke={isHovered ? s.stroke : `${s.stroke}99`}
                      strokeWidth={isHovered ? 1.8 : 1}
                      strokeDasharray={s.dash ? "4 3" : undefined}
                      style={{ transition: "stroke 0.2s" }}
                    />
                  )}

                  {/* Node label */}
                  <text
                    x={node.x + NODE_W / 2}
                    y={node.type === "database" ? node.y + NODE_H / 2 + 8 : node.y + NODE_H / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill: isHovered ? "#ffffff" : "rgba(226,232,240,0.9)",
                      fontSize: 10,
                      fontFamily: "var(--font-geist-mono)",
                      fontWeight: isHovered ? 600 : 400,
                      pointerEvents: "none",
                      transition: "fill 0.2s",
                    }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
