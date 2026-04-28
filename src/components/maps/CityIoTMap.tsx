"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// ── Sensor config ─────────────────────────────────────────────────────────────
type DeviceType = "air" | "traffic" | "energy" | "cctv" | "noise";

const TYPE_META: Record<DeviceType, { icon: string; unit: string; label: string; color: string; min: number; max: number; warnAt: number; alertAt: number }> = {
  air:     { icon: "💨", unit: "AQI",   label: "Air Quality",  color: "#06b6d4", min: 10,  max: 200, warnAt: 100, alertAt: 150 },
  traffic: { icon: "🚗", unit: "veh/h", label: "Traffic",       color: "#f59e0b", min: 50,  max: 1200, warnAt: 900, alertAt: 1100 },
  energy:  { icon: "⚡", unit: "kW",    label: "Energy",        color: "#a78bfa", min: 5,   max: 500, warnAt: 400, alertAt: 470 },
  cctv:    { icon: "📹", unit: "fps",   label: "CCTV",          color: "#10b981", min: 24,  max: 30,  warnAt: 26,  alertAt: 24 },
  noise:   { icon: "🔊", unit: "dB",    label: "Noise",         color: "#ef4444", min: 30,  max: 90,  warnAt: 70,  alertAt: 80 },
};

// Deterministic pseudo-random (seeded)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

// New Delhi districts as simplified polygons [lon, lat]
const DELHI_DISTRICTS: { name: string; color: string; coords: [number, number][] }[] = [
  {
    name: "Connaught Place",
    color: "#06b6d4",
    coords: [[77.205, 28.635], [77.225, 28.635], [77.225, 28.625], [77.205, 28.625], [77.205, 28.635]],
  },
  {
    name: "South Delhi",
    color: "#a78bfa",
    coords: [[77.180, 28.550], [77.240, 28.550], [77.240, 28.590], [77.180, 28.590], [77.180, 28.550]],
  },
  {
    name: "Karol Bagh",
    color: "#f59e0b",
    coords: [[77.185, 28.645], [77.215, 28.645], [77.215, 28.630], [77.185, 28.630], [77.185, 28.645]],
  },
  {
    name: "Chandni Chowk",
    color: "#10b981",
    coords: [[77.225, 28.660], [77.250, 28.660], [77.250, 28.645], [77.225, 28.645], [77.225, 28.660]],
  },
  {
    name: "Dwarka",
    color: "#ef4444",
    coords: [[77.025, 28.620], [77.070, 28.620], [77.070, 28.580], [77.025, 28.580], [77.025, 28.620]],
  },
];

interface Sensor {
  id: number;
  type: DeviceType;
  lat: number;
  lon: number;
  value: number;
  status: "ok" | "warn" | "alert";
}

function buildSensors(count = 200): Sensor[] {
  const r = mulberry32(99);
  const types: DeviceType[] = ["air", "traffic", "energy", "cctv", "noise"];
  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const meta = TYPE_META[type];
    const lat = 28.45 + r() * 0.35;
    const lon = 77.05 + r() * 0.32;
    const value = meta.min + r() * (meta.max - meta.min);
    const status = value >= meta.alertAt ? "alert" : value >= meta.warnAt ? "warn" : "ok";
    return { id: i, type, lat, lon, value: parseFloat(value.toFixed(1)), status };
  });
}

// Point-in-polygon check (ray-casting)
function pointInPolygon(pt: [number, number], vs: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function sensorsToGeoJSON(sensors: Sensor[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: sensors.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
      properties: {
        id: s.id,
        type: s.type,
        value: s.value,
        status: s.status,
        unit: TYPE_META[s.type].unit,
        icon: TYPE_META[s.type].icon,
        label: TYPE_META[s.type].label,
        color: TYPE_META[s.type].color,
        highlight: false,
      },
    })),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CityIoTMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const sensorsRef = useRef<Sensor[]>(buildSensors(200));
  const [toast, setToast] = useState<string | null>(null);
  const [zoneCount, setZoneCount] = useState<number | null>(null);
  const [filter, setFilter] = useState<DeviceType | "all">("all");
  const filterRef = useRef<DeviceType | "all">("all");

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Live value updates (update source every 2s)
  useEffect(() => {
    const interval = setInterval(() => {
      const r = mulberry32(Date.now() % 1e6);
      sensorsRef.current = sensorsRef.current.map((s) => {
        const meta = TYPE_META[s.type];
        const delta = (r() - 0.5) * (meta.max - meta.min) * 0.04;
        const value = Math.max(meta.min, Math.min(meta.max, s.value + delta));
        const status = value >= meta.alertAt ? "alert" : value >= meta.warnAt ? "warn" : "ok";
        return { ...s, value: parseFloat(value.toFixed(1)), status };
      });
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;
      const src = map.getSource("sensors") as mapboxgl.GeoJSONSource | undefined;
      if (!src) return;
      src.setData(buildFilteredGeoJSON(sensorsRef.current, filterRef.current, []));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function buildFilteredGeoJSON(
    sensors: Sensor[],
    f: DeviceType | "all",
    highlighted: number[]
  ): GeoJSON.FeatureCollection {
    const base = sensorsToGeoJSON(sensors);
    return {
      ...base,
      features: base.features
        .filter((ft) => f === "all" || ft.properties!.type === f)
        .map((ft) => ({
          ...ft,
          properties: {
            ...ft.properties,
            highlight: highlighted.includes(ft.properties!.id),
          },
        })),
    };
  }

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.209, 28.6139],
      zoom: 11,
    });
    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    drawRef.current = draw;
    map.addControl(draw, "top-left");
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Recompute zone highlights
    const recomputeZone = () => {
      const data = draw.getAll();
      const zones = data.features.filter(
        (f) => f.geometry.type === "Polygon"
      ) as GeoJSON.Feature<GeoJSON.Polygon>[];
      if (zones.length === 0) {
        setZoneCount(null);
        const src = map.getSource("sensors") as mapboxgl.GeoJSONSource | undefined;
        src?.setData(buildFilteredGeoJSON(sensorsRef.current, filterRef.current, []));
        return;
      }
      const ring = zones[0].geometry.coordinates[0] as [number, number][];
      const inZone = sensorsRef.current.filter((s) =>
        pointInPolygon([s.lon, s.lat], ring)
      );
      setZoneCount(inZone.length);
      const ids = inZone.map((s) => s.id);
      const src = map.getSource("sensors") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(buildFilteredGeoJSON(sensorsRef.current, filterRef.current, ids));
    };

    map.on("draw.create", recomputeZone);
    map.on("draw.update", recomputeZone);
    map.on("draw.delete", recomputeZone);

    map.on("load", () => {
      // ── District polygons ─────────────────────────────────────
      map.addSource("districts", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: DELHI_DISTRICTS.map((d) => ({
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [d.coords] },
            properties: { name: d.name, color: d.color },
          })),
        },
      });
      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: "districts",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.18, 0.06],
        },
      });
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "districts",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1,
          "line-opacity": 0.4,
        },
      });

      // District hover tooltip
      let hoveredDistrictId: number | null = null;
      const districtTooltip = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
      map.on("mousemove", "district-fill", (e) => {
        if (!e.features || e.features.length === 0) return;
        if (hoveredDistrictId !== null) {
          map.setFeatureState({ source: "districts", id: hoveredDistrictId }, { hover: false });
        }
        hoveredDistrictId = e.features[0].id as number;
        map.setFeatureState({ source: "districts", id: hoveredDistrictId }, { hover: true });
        const name = e.features[0].properties?.name ?? "";
        districtTooltip
          .setLngLat(e.lngLat)
          .setHTML(`<div style="font-family:monospace;font-size:12px;color:#e2e8f0;background:#0f172a;padding:4px 8px;border-radius:4px">${name}</div>`)
          .addTo(map);
      });
      map.on("mouseleave", "district-fill", () => {
        if (hoveredDistrictId !== null) {
          map.setFeatureState({ source: "districts", id: hoveredDistrictId }, { hover: false });
          hoveredDistrictId = null;
        }
        districtTooltip.remove();
      });

      // ── Sensors ───────────────────────────────────────────────
      map.addSource("sensors", {
        type: "geojson",
        data: buildFilteredGeoJSON(sensorsRef.current, "all", []),
        generateId: true,
      });

      // Status-based circle color expression
      map.addLayer({
        id: "sensors-glow",
        type: "circle",
        source: "sensors",
        filter: ["==", ["get", "status"], "alert"],
        paint: {
          "circle-radius": 14,
          "circle-color": "#ef4444",
          "circle-opacity": 0.15,
          "circle-blur": 1,
        },
      });
      map.addLayer({
        id: "sensors-circle",
        type: "circle",
        source: "sensors",
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["get", "highlight"], false], 8,
            ["==", ["get", "status"], "alert"], 7,
            5,
          ],
          "circle-color": [
            "match",
            ["get", "type"],
            "air",     "#06b6d4",
            "traffic", "#f59e0b",
            "energy",  "#a78bfa",
            "cctv",    "#10b981",
            "noise",   "#ef4444",
            "#888",
          ],
          "circle-opacity": [
            "case",
            ["boolean", ["get", "highlight"], false], 1,
            0.75,
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["get", "highlight"], false], 2,
            0,
          ],
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click popup
      const popup = new mapboxgl.Popup({ offset: 10, closeButton: true });
      popupRef.current = popup;

      map.on("click", "sensors-circle", (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties!;
        const statusColor = props.status === "alert" ? "#ef4444" : props.status === "warn" ? "#f59e0b" : "#10b981";
        popup
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:monospace;font-size:12px;background:#0f172a;padding:10px 12px;min-width:160px">
              <div style="color:${props.color};font-weight:bold;margin-bottom:6px">${props.icon} ${props.label}</div>
              <div style="color:#94a3b8">Value: <span style="color:#e2e8f0">${props.value} ${props.unit}</span></div>
              <div style="color:#94a3b8">Status: <span style="color:${statusColor}">${props.status.toUpperCase()}</span></div>
              <div style="color:#94a3b8;margin-top:4px;font-size:10px">ID: sensor-${String(props.id).padStart(3, "0")}</div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseenter", "sensors-circle", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "sensors-circle", () => { map.getCanvas().style.cursor = ""; });
    });

    return () => {
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filter changes to the map source
  const applyFilter = useCallback((f: DeviceType | "all") => {
    filterRef.current = f;
    setFilter(f);
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("sensors") as mapboxgl.GeoJSONSource | undefined;
    src?.setData(buildFilteredGeoJSON(sensorsRef.current, f, []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return (
      <div style={{ height: "100%", background: "#050a14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <span style={{ fontSize: 32 }}>🏙️</span>
        <p style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13, textAlign: "center", maxWidth: 320 }}>
          Mapbox token not configured.<br />
          Add <code style={{ color: "#06b6d4" }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> to <code style={{ color: "#06b6d4" }}>.env.local</code> to enable the interactive city map.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Map */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Filter bar */}
      <div style={{
        position: "absolute", top: 10, left: 44,
        display: "flex", gap: 6, flexWrap: "wrap",
      }}>
        {(["all", "air", "traffic", "energy", "cctv", "noise"] as const).map((t) => (
          <button
            key={t}
            onClick={() => applyFilter(t)}
            style={{
              background: filter === t ? "rgba(6,182,212,0.9)" : "rgba(5,10,20,0.85)",
              color: filter === t ? "#050a14" : "#94a3b8",
              border: "1px solid " + (filter === t ? "#06b6d4" : "rgba(255,255,255,0.1)"),
              borderRadius: 20,
              padding: "3px 10px",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {t === "all" ? "All" : `${TYPE_META[t].icon} ${t}`}
          </button>
        ))}
      </div>

      {/* Zone info + BPMN trigger */}
      {zoneCount !== null && (
        <div style={{
          position: "absolute", top: 50, right: 10,
          background: "rgba(5,10,20,0.92)", border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12,
          minWidth: 180,
        }}>
          <div style={{ color: "#06b6d4", marginBottom: 6 }}>Zone Analysis</div>
          <div style={{ color: "#94a3b8", marginBottom: 8 }}>
            <span style={{ color: "#e2e8f0" }}>{zoneCount}</span> sensors in zone
          </div>
          <button
            onClick={() => showToast(`BPMN workflow triggered · ${zoneCount} sensors enrolled`)}
            style={{
              width: "100%",
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.4)",
              color: "#06b6d4",
              borderRadius: 4,
              padding: "4px 0",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ▶ Trigger BPMN Workflow
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 30, right: 10,
        background: "rgba(5,10,20,0.88)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 11,
      }}>
        {Object.entries(TYPE_META).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
            <span style={{ color: "#94a3b8" }}>{v.icon} {k}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)", color: "#475569", fontSize: 10 }}>
          Draw polygon → zone analysis
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.5)",
          color: "#06b6d4", fontFamily: "monospace", fontSize: 12,
          padding: "10px 18px", borderRadius: 8,
          boxShadow: "0 4px 24px rgba(6,182,212,0.15)",
          animation: "fadeIn 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
