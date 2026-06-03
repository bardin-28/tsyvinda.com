# Plan: Contacts location map (Kyiv)

## Goal

Add a new section to `/contacts` that shows a Leaflet map centred on Kyiv,
Ukraine, draws the Kyiv city border from a GeoJSON source kept inside the repo,
and presents a short "My location: Kyiv" info block alongside it.

---

## Requirements

_List of provided requirements from customer_

- New block on the `/contacts` page below the existing contact channels.
- Leaflet map centred on Kyiv, Ukraine.
- Kyiv city border rendered from GeoJSON.
- GeoJSON stored in the project for now, in a `geo` folder inside `src/shared/`.
- Section copy stating the location is Kyiv.
- Use `react-leaflet` + `leaflet` (approved).

---

## Architectural decisions

- **GeoJSON as a typed shared module** — `src/shared/geo/kyiv.ts` exports a
  typed `FeatureCollection` (Kyiv border polygon) plus a `KYIV_CENTER`
  `[lat, lng]` const and `KYIV_DEFAULT_ZOOM`. Imported directly; no network
  fetch, no `/api` proxy involvement. Single source for coordinates so the map
  centre and the border stay in sync.
- **Map is client-only via `next/dynamic`** — Leaflet touches `window`, so the
  `LocationMap` component is loaded with `dynamic(..., { ssr: false })`, mirroring
  the existing `CylinderScene` pattern in `(home)/page.tsx`. The contacts page
  stays a normal client component; only the map subtree is deferred.
- **Self-contained route component** — `src/app/contacts/components/LocationMap/`
  holds the component + its CSS Module, matching the per-route folder convention.
  No marker pin is needed (border polygon + label conveys location), avoiding the
  Leaflet default-icon asset workaround.
- **react-leaflet primitives** — `MapContainer`, `TileLayer` (OpenStreetMap),
  `GeoJSON` styled with brand orange `#fd7e14`. Map auto-fits the border bounds.
- **Leaflet CSS** — import `leaflet/dist/leaflet.css` inside the `LocationMap`
  component module so it ships only with the deferred chunk.
- **Reduced-motion / loading** — show a styled placeholder while the dynamic
  chunk loads; disable scroll-wheel zoom so the map doesn't trap page scroll.

---

## Implementation Checklist

### ☑ Phase 1 — GeoJSON data + dependencies

- **Step 1** — Install `react-leaflet`, `leaflet`, and `@types/leaflet` (dev).
- **Step 2** — Create `src/shared/geo/kyiv.ts`: typed `FeatureCollection`
  approximating the Kyiv city boundary, `KYIV_CENTER: [number, number]`
  (lat, lng), `KYIV_DEFAULT_ZOOM`. Add a barrel `src/shared/geo/index.ts`.

### ☑ Phase 2 — LocationMap component

- **Step 1** — `src/app/contacts/components/LocationMap/LocationMap.tsx`:
  client component rendering `MapContainer` + OSM `TileLayer` + `GeoJSON`
  (brand-orange stroke/fill), fitting bounds to the border, scroll-zoom off.
- **Step 2** — `LocationMap.module.css`: rounded, bordered container matching
  the contacts surface treatment; fixed height responsive on mobile.
- **Step 3** — Import `leaflet/dist/leaflet.css` in the component.

### ☑ Phase 3 — Page integration

- **Step 1** — In `contacts/page.tsx`, `dynamic()`-import `LocationMap`
  (`ssr: false`) with a placeholder, add a new animated `<section>` with an
  eyebrow/heading + "Based in Kyiv, Ukraine" copy and the map.
- **Step 2** — Add styles for the location section/info block in
  `page.module.css`.

### ☑ Phase 4 — Tests + story

- **Step 1** — `LocationMap` unit test: mock `react-leaflet` + leaflet CSS,
  assert it renders the map container and feeds the Kyiv GeoJSON/center.
- **Step 2** — Extend `contacts/page.test.tsx`: assert the new location section
  heading renders (mock the dynamic map).
- **Step 3** — `LocationMap.stories.tsx` for the workshop.
- **Step 4** — Run `npm test` and `npm run lint`; confirm green.

---

## Important Notes

- `/api/*` is proxied to the separate backend, so the GeoJSON deliberately does
  **not** live behind `/api`; it is a repo-local module per the agreed decision.
- Brand orange `#fd7e14` is shared in four places (manifest, AntdProvider,
  three.js, CSS) — the map polygon reuses the same value but introduces no new
  source of truth.
- Kyiv border GeoJSON here is a simplified polygon (good enough for display); it
  can later be swapped for a higher-fidelity boundary or a real backend endpoint
  without touching the component (same `FeatureCollection` shape).
