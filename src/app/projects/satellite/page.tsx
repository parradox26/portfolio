import Nav from "@/components/Nav";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectMetrics from "@/components/projects/ProjectMetrics";
import ArchitectureDiagram from "@/components/projects/ArchitectureDiagram";
import DemoTransition from "@/components/projects/DemoTransition";
import ProjectNav from "@/components/projects/ProjectNav";
import SatelliteTracker2DClient from "@/components/SatelliteTracker2DClient";
import { projectDetails, PROJECT_NAV_ORDER } from "@/lib/data/portfolio";

const detail = projectDetails["satellite"];
const navIdx = PROJECT_NAV_ORDER.findIndex((p) => p.slug === "satellite");
const prevProject = navIdx > 0 ? PROJECT_NAV_ORDER[navIdx - 1] : undefined;
const nextProject = navIdx < PROJECT_NAV_ORDER.length - 1 ? PROJECT_NAV_ORDER[navIdx + 1] : undefined;

export default function SatellitePage() {
  return (
    <>
      <Nav />
      <ProjectHero
        name={detail.name}
        icon={detail.icon}
        tagline={detail.tagline}
        year={detail.year}
        role={detail.role}
        techStack={detail.techStack}
        metricsSummary={detail.metrics.map((m) => ({ label: m.label, value: m.value }))}
        demoLabel="Live Globe"
      />
      <ProjectOverview paragraphs={detail.overview} />
      <ProjectMetrics metrics={detail.metrics} />
      <ArchitectureDiagram nodes={detail.architecture.nodes} edges={detail.architecture.edges} />
      <DemoTransition label="Live Satellite Tracker" />

      {/* Demo section — height:100vh so the canvas gets a concrete pixel height */}
      <div className="flex flex-col" style={{ height: "100vh", background: "var(--bg)" }}>
        <div
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
          className="flex items-center justify-between px-6 py-3 shrink-0"
        >
          <div>
            <h2 style={{ color: "var(--text)" }} className="font-bold text-base">🛰️ Real-Time Satellite Tracker</h2>
            <p style={{ color: "var(--muted)" }} className="text-xs font-mono mt-0.5">
              SGP4 propagation · 18 satellites · Mercator ground track · click to inspect
            </p>
          </div>
          <span
            style={{ background: "var(--surface2)", color: "var(--green)", border: "1px solid var(--green)" }}
            className="text-[10px] font-mono px-3 py-1 rounded-full"
          >
            ● LIVE
          </span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div style={{ position: "absolute", inset: 0 }}>
            <SatelliteTracker2DClient />
          </div>
        </div>

        <div
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
          className="px-6 py-3 flex flex-wrap gap-6 text-xs font-mono shrink-0"
        >
          {[
            ["Propagation", "SGP4 / satellite.js"],
            ["Projection",  "Mercator 2D ground track"],
            ["Data",        "TLE (Two-Line Element sets)"],
            ["Orbits",      "LEO · MEO · GEO"],
            ["Update rate", "1 s interval"],
          ].map(([k, v]) => (
            <span key={k}>
              <span style={{ color: "var(--muted)" }}>{k}: </span>
              <span style={{ color: "var(--accent)" }}>{v}</span>
            </span>
          ))}
        </div>
      </div>

      <ProjectNav
        prev={prevProject ? { name: prevProject.name, href: prevProject.href, icon: prevProject.icon } : undefined}
        next={nextProject ? { name: nextProject.name, href: nextProject.href, icon: nextProject.icon } : undefined}
      />
    </>
  );
}
