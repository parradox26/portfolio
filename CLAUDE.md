@AGENTS.md

# Portfolio — Project Reference

## What this is
A Next.js portfolio site. Each project lives under `src/app/projects/<slug>/page.tsx` and follows the pattern: **hero → overview → metrics → architecture diagram → demo transition → interactive live demo**.

---

## Project inventory

### City IoT · `src/app/projects/city-iot/page.tsx`
200 simulated IoT sensors (air, traffic, energy, cctv, noise) over London on a canvas.
- Map background: OpenStreetMap tiles at zoom 14, fetched with `crossOrigin = "anonymous"`, cached in `tileImgRef`. Dark overlay `rgba(2,10,26,0.52)` keeps sensor dots readable.
- Tile helpers: `latLonToTile` (Web Mercator → tile tx/ty) and `tileTopLeft` (tile → NW lat/lon corner). Canvas projection is linear — distortion is negligible over the 0.12° × 0.18° viewport.
- `tilesTick` state triggers redraws as tiles arrive. Attribution `© OpenStreetMap contributors` pinned bottom-right.
- Center: `{ lat: 51.505, lon: -0.09 }` · `LAT_RANGE = 0.12` · `LON_RANGE = 0.18`

### Satellite Tracker 2D · `src/components/SatelliteTracker2D.tsx`
18 real satellites tracked via SGP4 on a Mercator world canvas (TopoJSON land + borders).
- **AOI**: "Draw AOI" button → click-drag → `computeNextPass()` scans 24 h in 1-min SGP4 steps, returns minutes-to-first-pass or `null`. Result shown as "in Xh Ym" or "none in 24 h".
- AOI dual-tracked: `aoiRef` (canvas, read every frame) + `aoi` React state (info panel).
- Live drag preview from `dragStartRef` / `dragCurRef`. Switching satellite re-runs pass calc for existing AOI.
- Inverse projection helpers at file top: `xToLon`, `yToLat`.
- Used by both `satellite` and `cubesat` pages via `SatelliteTracker2DClient`.

### Satellite Globe · `src/components/SatelliteGlobe.tsx`
THREE.js 3D globe — 18 satellite meshes, 120-point orbit trails, raycaster click-to-select, drag-to-rotate. Used by the `satellite` page via `SatelliteGlobeClient`.

### CubeSat · `src/app/projects/cubesat/page.tsx`
Two-panel demo: 2D satellite tracker (`SatelliteTracker2DClient`) + AI mission chatbot (Claude API, streaming, typewriter render via `TypewriterText`).

### Demand Forecasting · `src/app/projects/demand-forecasting/page.tsx`
Interactive forecast chart — 3 SKU profiles (seasonal / steady / intermittent), two models (LightGBM, TFT). Recharts `ComposedChart` with confidence interval `Area` bands. No canvas.

### Golden Batch · `src/app/projects/golden-batch/page.tsx`
Simulated annealing over a 3-parameter yield surface (temp, pressure, viscosity). Canvas heatmap shows temp × pressure slice; `yieldFn` has a multi-modal landscape with a known global optimum.

### Library SaaS · `src/app/projects/library/page.tsx`
Operations center dashboard via `LibraryDashboardClient` → `LibraryDashboard.tsx`.
> Slug in `portfolio.ts` is `library-saas`; route is `/projects/library`.

### Loan Genie · `src/app/projects/loan-genie/page.tsx`
AI loan decision tool (Claude API → structured JSON: decision, risk score, rate, payment, strengths/concerns). Rate-limited to 5 calls/day via `localStorage` key `loan_genie_usage`.

### RFID Warehouse · `src/app/projects/rfid/page.tsx`
Canvas 8 × 10 warehouse grid simulating RFID/NFC scan events. Statuses: `in_stock`, `checked_out`, `missing`, `quarantine`. Uses `ProjectDetailSection` — no hero/overview/metrics structure.

### Certificate Lifecycle · `src/app/projects/certificate/page.tsx`
Interactive TLS cert state machine — 5 certs, states `pending → issued → active → expiring → expired / revoked / renewed`. Transitions enforced via `STATE_TRANSITIONS` map. No canvas.

---

## Shared files

| File | Purpose |
|------|---------|
| `src/lib/data/portfolio.ts` | All project metadata + `PROJECT_NAV_ORDER` |
| `src/lib/data/tles.ts` | TLE data for 18 tracked satellites |
| `src/components/projects/` | `ProjectHero`, `ProjectOverview`, `ProjectMetrics`, `ArchitectureDiagram`, `DemoTransition`, `ProjectNav` |
| `src/components/SatelliteTracker2D.tsx` | 2D tracker + AOI (satellite + cubesat) |
| `src/components/SatelliteGlobe.tsx` | THREE.js globe (satellite) |
| `src/components/LibraryDashboard.tsx` | Library ops dashboard |

---

## Dependencies

| Package | Used by |
|---------|---------|
| `satellite.js` | SGP4 propagation — all satellite/cubesat demos |
| `topojson-client` + `world-atlas` | World map geometry — Satellite 2D |
| `three` | 3D globe |
| `recharts` | Charts — Demand Forecasting |
| `@anthropic-ai/sdk` | Claude API — CubeSat chatbot, Loan Genie |
| OSM tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Background map — City IoT (no API key) |

---

## Environment & deployment

- **Node.js 20+** required (`node:` protocol used by packages).
- **Run dev server** (Windows): `node node_modules/next/dist/bin/next dev` — do not use `npm run dev` (cmd.exe PATH issue).
- **Install**: if postinstall scripts fail (`napi-postinstall` / `unrs-resolver`), use `npm install --ignore-scripts`.
- **Deploy**: Vercel — push to `main` triggers deploy. No custom build command needed.
- `.claude/` and `.env.local` are gitignored — never commit them.
