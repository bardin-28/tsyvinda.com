import { render, screen } from "@testing-library/react";
import { SOCIAL_NAV } from "@/shared/const";
import ContactsPage from "./page";

// The map is a client-only Leaflet component pulled in via next/dynamic; stub it
// so the page test stays in jsdom and focuses on page markup.
jest.mock("./components/LocationMap/LocationMap", () => ({
  __esModule: true,
  default: () => <div data-testid="location-map" />,
}));

describe("ContactsPage", () => {
  it("renders the hero heading", () => {
    render(<ContactsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /work together/i,
    );
  });

  it("renders every contact channel with its href and handle", () => {
    render(<ContactsPage />);

    for (const item of SOCIAL_NAV) {
      const link = screen.getByRole("link", {
        name: `${item.label}: ${item.handle}`,
      });
      expect(link).toHaveAttribute("href", item.href);
      expect(link).toHaveTextContent(item.label);
      expect(link).toHaveTextContent(item.handle);
    }
  });

  it("opens external channels in a new tab but not mailto links", () => {
    render(<ContactsPage />);

    const linkedin = screen.getByRole("link", { name: /^LinkedIn:/ });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    const email = screen.getByRole("link", { name: /^Email:/ });
    expect(email).not.toHaveAttribute("target");
  });

  it("mentions the Kyiv location and renders the map", async () => {
    render(<ContactsPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /work together/i,
    );
    expect(screen.getByText(/kyiv, ukraine/i)).toBeInTheDocument();
    // The map is loaded via next/dynamic, so it resolves after a tick.
    expect(await screen.findByTestId("location-map")).toBeInTheDocument();
  });
});
