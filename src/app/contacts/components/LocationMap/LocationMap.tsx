"use client";

import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { PathOptions } from "leaflet";
import { KYIV_BORDER, KYIV_CENTER, KYIV_DEFAULT_ZOOM } from "@/shared/geo";
import "leaflet/dist/leaflet.css";
import styles from "./LocationMap.module.css";

const ACCENT = "#fd7e14";

/** Brand-orange outline + soft fill for the Kyiv border polygon. */
const BORDER_STYLE: PathOptions = {
  color: ACCENT,
  weight: 2,
  opacity: 0.9,
  fillColor: ACCENT,
  fillOpacity: 0.12,
};

/**
 * Bounds of the Kyiv border, computed once so the map opens framed on the city
 * instead of relying on the static centre/zoom alone. Computed at module load
 * (client-only — this component is imported with `ssr: false`).
 */
const KYIV_BOUNDS = L.geoJSON(KYIV_BORDER).getBounds();

/**
 * Read-only Leaflet map centred on Kyiv showing the city border. Imported via
 * `next/dynamic` with `ssr: false` because Leaflet needs `window`.
 */
export default function LocationMap() {
  return (
    <MapContainer
      className={styles.map}
      center={KYIV_CENTER}
      zoom={KYIV_DEFAULT_ZOOM}
      bounds={KYIV_BOUNDS}
      boundsOptions={{ padding: [24, 24] }}
      scrollWheelZoom={false}
      attributionControl
      aria-label="Map of Kyiv, Ukraine showing the city border"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <GeoJSON data={KYIV_BORDER} style={BORDER_STYLE} />
    </MapContainer>
  );
}
