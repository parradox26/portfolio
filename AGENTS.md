<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent rules for this codebase

## Before touching any demo component
Read the full component file first. Each demo has its own rendering pattern. The rAF loop reads **refs only** inside the closure — never React state. Any state needed inside rAF must be synced to a ref via `useEffect`.

---

## Canvas rendering patterns

Two patterns are in use — choose the right one, never mix them.

**Pattern A — Continuous loop** (Satellite 2D, Golden Batch, RFID):
```ts
const draw = useCallback(() => {
  // read refs only — no state
  animRef.current = requestAnimationFrame(draw);
}, []); // stable, zero deps

useEffect(() => {
  animRef.current = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(animRef.current);
}, [draw]);
```
Use when the canvas must update every frame regardless of data changes.

**Pattern B — Re-render triggered** (City IoT):
```ts
useEffect(() => {
  const draw = () => { /* draw once */ };
  draw();
  animRef.current = requestAnimationFrame(draw); // catch next frame
  return () => cancelAnimationFrame(animRef.current);
}, [devices, filter, selected, tilesTick]); // data deps drive redraws
```
Use when the canvas only needs to update when data changes.

---

## Canvas projections — never mix

| Component | Projection | Helpers |
|-----------|------------|---------|
| City IoT | Linear lat/lon — small London viewport | `latToY`, `lonToX` (callbacks) |
| Satellite 2D | Equirectangular Mercator | `lonToX`, `latToY`, `xToLon`, `yToLat` (module-level) |

OSM tile fetch in City IoT uses Web Mercator (`latLonToTile` / `tileTopLeft`), but the 0.12° viewport makes the mismatch with the linear canvas projection invisible.

---

## Feature-specific rules

### OSM tiles (City IoT)
- `img.crossOrigin = "anonymous"` is mandatory — omitting it taints the canvas and blocks `drawImage`.
- Cache lives in `tileImgRef` (a `Map` inside a ref). Never recreate the Map on re-render.
- On `img.onload`, call `setTilesTick(n => n + 1)` to trigger a canvas redraw.
- Zoom 14 fills the London viewport in ~8–9 tiles per axis — do not raise zoom without counting tiles first.
- Always render `© OpenStreetMap contributors` on the canvas (bottom-right, 9 px monospace).

### AOI / next-pass (Satellite 2D)
- `computeNextPass` returns `null` for GEO satellites that never cross the AOI in 24 h — this is correct, not a bug.
- AOI is dual-tracked: `aoiRef.current` for canvas (every frame) and `aoi` React state for the info panel. Both must stay in sync.
- To clear AOI: set `aoiRef.current = null` **and** call `setAoi(null)` together.
- Re-run `computeNextPass` on satellite change — there is already a `useEffect([selectedIdx])` for this; keep it.
- UI copy: label the result "mocked · SGP4 propagation" (computation is real, but ETA is an approximation).

### Claude API (CubeSat, Loan Genie)
- Both require `ANTHROPIC_API_KEY` in `.env.local`.
- Loan Genie enforces 5 calls/day via `localStorage` key `loan_genie_usage` — do not remove this guard.
- CubeSat chatbot uses streaming; responses render via `TypewriterText` (12 ms/char interval).

---

## Adding a new project

1. Add all metadata to `src/lib/data/portfolio.ts`: `name`, `slug`, `icon`, `tagline`, `year`, `role`, `techStack`, `metrics`, `overview`, `architecture`. Push the slug into `PROJECT_NAV_ORDER`.
2. Create `src/app/projects/<slug>/page.tsx` following: hero → overview → metrics → architecture → demo-transition → demo.
3. Canvas demos: choose Pattern A or B above and follow the ref-only rule in the draw closure.
4. Claude API demos: add a daily rate-limit guard (model on Loan Genie) and handle streaming if needed.
5. Do not change `PROJECT_NAV_ORDER` without verifying the prev/next links on all adjacent project pages.

---

## What NOT to do

- **No map libraries** (Leaflet, Mapbox, etc.) — canvas + OSM tiles is intentional: no API key, no bundle bloat.
- **No state reads inside `useCallback([], [])`** — sync to a ref first.
- **No mocking `satellite.js`** — use real SGP4 propagation; "mocked" label in UI is for approximate ETA display only.
- **No committing `.env.local` or `.claude/`** — both are gitignored.
- **No reordering `PROJECT_NAV_ORDER`** without updating navigation across all affected pages.
