"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { TLES } from "@/lib/data/tles";


function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

interface SatInfo {
  name: string;
  type: string;
  lat: number;
  lon: number;
  alt: number;
  color: string;
}

export default function SatelliteGlobe({ compact = false }: { compact?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SatInfo | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts: number[] = [];
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 50;
      starVerts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })));

    // Earth
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x0d1b2e,
      emissive: 0x051020,
      specular: 0x1e3a5f,
      shininess: 15,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Grid lines on Earth
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.4 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 4) pts.push(latLonToVec3(lat, lon, 1.001));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lon = -180; lon <= 180; lon += 20) {
      const pts: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 2) pts.push(latLonToVec3(lat, lon, 1.001));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.08, 32, 32);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x0088cc,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Satellite meshes
    const satMeshes: THREE.Mesh[] = [];
    const satGeo = new THREE.SphereGeometry(0.018, 8, 8);
    TLES.forEach((tle) => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tle.color) });
      const mesh = new THREE.Mesh(satGeo, mat);
      scene.add(mesh);
      satMeshes.push(mesh);
    });

    // Orbit trail points per satellite
    const TRAIL_POINTS = 120;
    const trailGeos: THREE.BufferGeometry[] = [];
    const trailLines: THREE.Line[] = [];
    TLES.forEach((tle) => {
      const pts = new Float32Array(TRAIL_POINTS * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: new THREE.Color(tle.color), transparent: true, opacity: 0.3 })
      );
      scene.add(line);
      trailGeos.push(geo);
      trailLines.push(line);
    });

    // Raycaster for click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(satMeshes);
      if (hits.length > 0) {
        const idx = satMeshes.indexOf(hits[0].object as THREE.Mesh);
        const tle = TLES[idx];
        const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        const now = new Date();
        const pv = satellite.propagate(satrec, now);
        if (pv && typeof pv.position !== "boolean" && pv.position) {
          const gmst = satellite.gstime(now);
          const gd = satellite.eciToGeodetic(pv.position, gmst);
          setSelected({
            name: tle.name,
            type: tle.type,
            lat: parseFloat(satellite.degreesLat(gd.latitude).toFixed(2)),
            lon: parseFloat(satellite.degreesLong(gd.longitude).toFixed(2)),
            alt: parseFloat((gd.height).toFixed(0)),
            color: tle.color,
          });
        }
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // Drag to rotate
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0, rotY = 0;
    renderer.domElement.addEventListener("mousedown", (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener("mouseup", () => { isDragging = false; });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevMouse.x) * 0.005;
      rotX += (e.clientY - prevMouse.y) * 0.005;
      rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    // Trail history per satellite
    const trailHistory: THREE.Vector3[][] = TLES.map(() => []);

    // Animation
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = new Date();

      let count = 0;
      TLES.forEach((tle, i) => {
        try {
          const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
          const pv = satellite.propagate(satrec, now);
          if (!pv || typeof pv.position === "boolean" || !pv.position) return;
          const gmst = satellite.gstime(now);
          const gd = satellite.eciToGeodetic(pv.position, gmst);
          const lat = satellite.degreesLat(gd.latitude);
          const lon = satellite.degreesLong(gd.longitude);
          const alt = gd.height / 6371; // normalize to Earth radius units
          const r = 1 + alt;
          const pos = latLonToVec3(lat, lon, r);
          satMeshes[i].position.copy(pos);
          count++;

          // Trail
          const hist = trailHistory[i];
          hist.push(pos.clone());
          if (hist.length > TRAIL_POINTS) hist.shift();
          const posAttr = trailGeos[i].attributes.position as THREE.BufferAttribute;
          for (let j = 0; j < TRAIL_POINTS; j++) {
            const v = hist[j] || pos;
            posAttr.setXYZ(j, v.x, v.y, v.z);
          }
          posAttr.needsUpdate = true;
          trailGeos[i].setDrawRange(0, hist.length);
        } catch { /* skip */ }
      });
      setLiveCount(count);

      earth.rotation.y += 0.0008;
      // Apply drag rotation
      earth.rotation.x += (rotX - earth.rotation.x) * 0.1;
      const pivot = new THREE.Euler(rotX, rotY, 0);
      scene.rotation.set(pivot.x, pivot.y, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const W = mount.clientWidth, H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", () => {});
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Live counter */}
      <div
        style={{ background: "rgba(5,10,20,0.8)", border: "1px solid var(--border)" }}
        className="absolute top-4 left-4 px-3 py-2 rounded-lg text-xs font-mono"
      >
        <div style={{ color: "var(--accent)" }} className="font-bold text-sm">{liveCount}</div>
        <div style={{ color: "var(--muted)" }}>satellites tracked</div>
      </div>

      {/* Legend */}
      {!compact && (
        <div
          style={{ background: "rgba(5,10,20,0.8)", border: "1px solid var(--border)" }}
          className="absolute bottom-4 left-4 px-3 py-2 rounded-lg text-xs font-mono space-y-1"
        >
          {[
            { color: "#00d4ff", label: "Station" },
            { color: "#7c3aed", label: "Starlink" },
            { color: "#10b981", label: "GPS" },
            { color: "#f59e0b", label: "Weather" },
            { color: "#ef4444", label: "Space Tel" },
            { color: "#06b6d4", label: "Earth Obs" },
            { color: "#a78bfa", label: "SAR/Optical" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div style={{ background: l.color, width: 8, height: 8, borderRadius: "50%" }} />
              <span style={{ color: "var(--muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Satellite info panel */}
      {selected && (
        <div
          style={{ background: "rgba(13,27,46,0.95)", border: `1px solid ${selected.color}` }}
          className="absolute top-4 right-4 p-4 rounded-xl text-xs font-mono w-52"
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: selected.color }} className="font-bold text-sm">{selected.name}</span>
            <button onClick={() => setSelected(null)} style={{ color: "var(--muted)" }} className="hover:text-white">✕</button>
          </div>
          <div style={{ color: "var(--muted)" }} className="space-y-1">
            <div><span style={{ color: "var(--text)" }}>Type:</span> {selected.type}</div>
            <div><span style={{ color: "var(--text)" }}>Lat:</span> {selected.lat}°</div>
            <div><span style={{ color: "var(--text)" }}>Lon:</span> {selected.lon}°</div>
            <div><span style={{ color: "var(--text)" }}>Alt:</span> {selected.alt} km</div>
          </div>
        </div>
      )}

      {!compact && (
        <div
          style={{ color: "var(--muted)" }}
          className="absolute bottom-4 right-4 text-xs font-mono"
        >
          drag to rotate · click satellite for info
        </div>
      )}
    </div>
  );
}
