"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// ── Orbital constants ─────────────────────────────────────────────────────────
const INC_DEG = 97.4;
const INC = INC_DEG * (Math.PI / 180);
const ALT_KM = 500;
const R_EARTH = 6371;
const ORBIT_R = R_EARTH + ALT_KM;
const GM = 3.986004418e14; // m³/s²
const PERIOD = 2 * Math.PI * Math.sqrt(Math.pow(ORBIT_R * 1e3, 3) / GM); // seconds ≈ 5666
const W_EARTH = 7.2921150e-5; // rad/s

// ── Ground-station coverage radius ───────────────────────────────────────────
const GS_RADIUS_KM = 2000;
const GS_ANGULAR_RAD = GS_RADIUS_KM / R_EARTH; // radians

const GROUND_STATIONS = [
  { name: "Svalbard",  lat: 78.25,  lon: 15.47,  color: "#4488ff" },
  { name: "Bangalore", lat: 12.97,  lon: 77.59,  color: "#44ffaa" },
  { name: "Fairbanks", lat: 64.84,  lon: -147.72, color: "#ff8844" },
];

// ── Math helpers ──────────────────────────────────────────────────────────────
function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

function satPos(t: number): [number, number] {
  const M = (2 * Math.PI / PERIOD) * t;
  const lat = toDeg(Math.asin(Math.sin(INC) * Math.sin(M)));
  const lonRad = Math.atan2(Math.cos(INC) * Math.sin(M), Math.cos(M)) - W_EARTH * t;
  let lon = toDeg(lonRad) % 360;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return [lon, lat];
}

// Generate ground track as array of [lon, lat] positions
function buildTrack(numOrbits = 3, stepSec = 30): [number, number][][] {
  const totalSec = numOrbits * PERIOD;
  const segments: [number, number][][] = [];
  let seg: [number, number][] = [];
  let prevLon: number | null = null;
  for (let t = 0; t <= totalSec; t += stepSec) {
    const [lon, lat] = satPos(t);
    if (prevLon !== null && Math.abs(lon - prevLon) > 180) {
      if (seg.length > 1) segments.push(seg);
      seg = [];
    }
    seg.push([lon, lat]);
    prevLon = lon;
  }
  if (seg.length > 1) segments.push(seg);
  return segments;
}

// Great-circle coverage polygon around a ground station
function coveragePolygon(lat0: number, lon0: number, steps = 64): [number, number][] {
  const lat0r = toRad(lat0);
  const lon0r = toRad(lon0);
  const d = GS_ANGULAR_RAD;
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (2 * Math.PI * i) / steps;
    const latR = Math.asin(
      Math.sin(lat0r) * Math.cos(d) + Math.cos(lat0r) * Math.sin(d) * Math.cos(bearing)
    );
    const lonR = lon0r + Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat0r),
      Math.cos(d) - Math.sin(lat0r) * Math.sin(latR)
    );
    ring.push([toDeg(lonR), toDeg(latR)]);
  }
  return ring;
}

interface PassWindow {
  station: string;
  aos: number; // time in seconds
  los: number;
}

function computePassWindows(t0: number): PassWindow[] {
  const windows: PassWindow[] = [];
  const CHECK_HORIZON = 2 * PERIOD;
  const STEP = 30;
  GROUND_STATIONS.forEach((gs) => {
    const gsLat = toRad(gs.lat);
    const gsLon = toRad(gs.lon);
    let inPass = false;
    let aos = 0;
    for (let dt = 0; dt <= CHECK_HORIZON; dt += STEP) {
      const [lon, lat] = satPos(t0 + dt);
      const satLat = toRad(lat);
      const satLon = toRad(lon);
      // Central angle
      const ca = Math.acos(
        Math.sin(gsLat) * Math.sin(satLat) +
        Math.cos(gsLat) * Math.cos(satLat) * Math.cos(satLon - gsLon)
      );
      const dist = ca * R_EARTH;
      const inRange = dist < GS_RADIUS_KM;
      if (inRange && !inPass) { inPass = true; aos = dt; }
      if (!inRange && inPass) {
        windows.push({ station: gs.name, aos: t0 + aos, los: t0 + dt });
        inPass = false;
      }
    }
  });
  return windows.sort((a, b) => a.aos - b.aos);
}

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600) % 24;
  const m = Math.floor(sec / 60) % 60;
  const s = Math.floor(sec) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} UTC`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrbitalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const [passes, setPasses] = useState<PassWindow[]>([]);
  const [aoiActive, setAoiActive] = useState(false);
  const [passCount, setPassCount] = useState<number | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [0, 20],
      zoom: 1.5,
      projection: "globe",
    });

    mapRef.current = map;

    // ── Draw control ─────────────────────────────────────────────
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    drawRef.current = draw;
    map.addControl(draw, "top-left");
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl());

    // AoI pass computation
    const onDrawCreate = () => {
      setAoiActive(true);
      const now = elapsedRef.current;
      const wins = computePassWindows(now);
      setPassCount(wins.length);
      setPasses(wins.slice(0, 6));
    };
    const onDrawDelete = () => {
      setAoiActive(false);
      setPassCount(null);
      setPasses([]);
    };
    map.on("draw.create", onDrawCreate);
    map.on("draw.delete", onDrawDelete);

    map.on("load", () => {
      try { map.setFog({ color: "rgb(5,10,20)", "high-color": "rgb(5,10,30)", "horizon-blend": 0.02 }); } catch (_) {}

      // ── Ground track ──────────────────────────────────────────
      const trackSegments = buildTrack(3, 30);
      map.addSource("track", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates: trackSegments,
          },
          properties: {},
        },
      });
      map.addLayer({
        id: "track-line",
        type: "line",
        source: "track",
        paint: {
          "line-color": "#00ff88",
          "line-width": 1.5,
          "line-opacity": 0.75,
        },
      });
      // Ghost/predicted track (lighter)
      map.addLayer({
        id: "track-line-glow",
        type: "line",
        source: "track",
        paint: {
          "line-color": "#00ff88",
          "line-width": 4,
          "line-opacity": 0.12,
          "line-blur": 4,
        },
      });

      // ── Ground stations + coverage circles ───────────────────
      GROUND_STATIONS.forEach((gs) => {
        const ring = coveragePolygon(gs.lat, gs.lon);
        const srcId = `gs-${gs.name}`;
        map.addSource(srcId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Polygon", coordinates: [ring] },
                properties: { name: gs.name },
              },
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [gs.lon, gs.lat] },
                properties: { name: gs.name },
              },
            ],
          },
        });
        map.addLayer({
          id: `gs-fill-${gs.name}`,
          type: "fill",
          source: srcId,
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: { "fill-color": gs.color, "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: `gs-line-${gs.name}`,
          type: "line",
          source: srcId,
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: { "line-color": gs.color, "line-width": 1, "line-opacity": 0.5, "line-dasharray": [4, 4] },
        });

        // Station label
        const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
          .setHTML(`<div style="color:${gs.color};font-family:monospace;font-size:11px;background:#050a14;padding:4px 8px;border:1px solid ${gs.color}33">${gs.name.toUpperCase()} GS</div>`);

        new mapboxgl.Marker({ color: gs.color })
          .setLngLat([gs.lon, gs.lat])
          .setPopup(popup)
          .addTo(map);
      });

      // ── Satellite marker ──────────────────────────────────────
      const el = document.createElement("div");
      el.style.cssText = `
        width:16px;height:16px;
        background:#00ff88;
        border:2px solid #fff;
        border-radius:50%;
        box-shadow:0 0 12px #00ff88;
        cursor:pointer;
      `;
      const [initLon, initLat] = satPos(0);
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([initLon, initLat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText("Genmat-01 · 500km SSO · 97.4°"))
        .addTo(map);
      markerRef.current = marker;

      // Animate satellite
      const t0 = Date.now() / 1000;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() / 1000 - t0;
        elapsedRef.current = elapsed;
        const [lon, lat] = satPos(elapsed);
        marker.setLngLat([lon, lat]);
      }, 1000);

      // Initial pass windows
      setPasses(computePassWindows(0).slice(0, 6));
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return (
      <div style={{ height: "100%", background: "#050a14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <span style={{ color: "#00ff88", fontSize: 32 }}>🛰️</span>
        <p style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13, textAlign: "center", maxWidth: 320 }}>
          Mapbox token not configured.<br />
          Add <code style={{ color: "#00ff88" }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> to <code style={{ color: "#00ff88" }}>.env.local</code> to enable the 3D globe.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Map container */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Pass window panel */}
      <div style={{
        position: "absolute", top: 10, right: 10, width: 220,
        background: "rgba(5,10,20,0.92)", border: "1px solid rgba(0,255,136,0.2)",
        borderRadius: 8, fontFamily: "monospace", fontSize: 11, overflow: "hidden",
      }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,255,136,0.15)", color: "#00ff88" }}>
          {aoiActive
            ? `AoI Pass Windows (${passCount ?? 0} found)`
            : "Upcoming GS Passes"}
        </div>
        <div style={{ padding: "6px 12px 8px", maxHeight: 200, overflowY: "auto" }}>
          {passes.length === 0
            ? <span style={{ color: "#475569" }}>Draw AoI polygon ↙</span>
            : passes.map((p, i) => (
              <div key={i} style={{ marginBottom: 6, color: "#94a3b8" }}>
                <span style={{ color: "#00ff88" }}>{p.station}</span><br />
                <span>AOS {fmtTime(p.aos)}</span><br />
                <span>LOS {fmtTime(p.los)} ({Math.round((p.los - p.aos) / 60)}m)</span>
              </div>
            ))
          }
        </div>
        <div style={{ padding: "6px 12px 8px", borderTop: "1px solid rgba(0,255,136,0.1)", color: "#475569" }}>
          Draw polygon → compute AoI passes
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 30, left: 10,
        background: "rgba(5,10,20,0.88)", border: "1px solid rgba(0,255,136,0.15)",
        borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 11,
      }}>
        {[
          { color: "#00ff88", label: "Genmat-01 SSO track" },
          { color: "#4488ff", label: "Svalbard GS (2000km)" },
          { color: "#44ffaa", label: "Bangalore GS (2000km)" },
          { color: "#ff8844", label: "Fairbanks GS (2000km)" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 12, height: 3, background: color, borderRadius: 2 }} />
            <span style={{ color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
