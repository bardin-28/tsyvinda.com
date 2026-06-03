import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { KYIV_BORDER, KYIV_CENTER } from "@/shared/geo";
import LocationMap from "./LocationMap";

// react-leaflet renders a real Leaflet map that jsdom can't drive, so the
// primitives are mocked into plain elements that surface their props for
// assertions.
type MapContainerProps = {
  children: ReactNode;
  center: [number, number];
  scrollWheelZoom: boolean;
  "aria-label": string;
};
type TileLayerProps = { url: string; attribution: string };
type GeoJsonProps = { data: unknown };

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, center, scrollWheelZoom, ...rest }: MapContainerProps) => (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(center)}
      data-scroll-wheel-zoom={String(scrollWheelZoom)}
      aria-label={rest["aria-label"]}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: TileLayerProps) => (
    <div data-testid="tile-layer" data-url={url} data-attribution={attribution} />
  ),
  GeoJSON: ({ data }: GeoJsonProps) => (
    <div data-testid="geojson" data-feature-count={String((data as typeof KYIV_BORDER).features.length)} />
  ),
}));

// `L.geoJSON(...).getBounds()` runs at module load; stub it so no real Leaflet
// math is needed in jsdom.
jest.mock("leaflet", () => ({
  __esModule: true,
  default: {
    geoJSON: () => ({ getBounds: () => ({}) }),
  },
}));

describe("LocationMap", () => {
  it("renders the map centred on Kyiv with scroll-wheel zoom disabled", () => {
    render(<LocationMap />);

    const container = screen.getByTestId("map-container");
    expect(container).toHaveAttribute("data-center", JSON.stringify(KYIV_CENTER));
    expect(container).toHaveAttribute("data-scroll-wheel-zoom", "false");
    expect(container).toHaveAttribute("aria-label", expect.stringContaining("Kyiv"));
  });

  it("renders an attributed tile layer", () => {
    render(<LocationMap />);

    const tiles = screen.getByTestId("tile-layer");
    expect(tiles).toHaveAttribute("data-url", expect.stringContaining("{z}/{x}/{y}"));
    expect(tiles).toHaveAttribute("data-attribution", expect.stringContaining("OpenStreetMap"));
  });

  it("draws the Kyiv border GeoJSON", () => {
    render(<LocationMap />);

    expect(screen.getByTestId("geojson")).toHaveAttribute(
      "data-feature-count",
      String(KYIV_BORDER.features.length),
    );
  });
});
