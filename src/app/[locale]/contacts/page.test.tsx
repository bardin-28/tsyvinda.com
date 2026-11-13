import { screen } from "@testing-library/react";
import { SOCIAL_NAV } from "@/shared/const";
import { renderWithIntl, testMessages } from "@/shared/testing/intl";
import ContactsPage from "./page";

// The map is a client-only Leaflet component pulled in via next/dynamic; stub it
// so the page test stays in jsdom and focuses on page markup.
jest.mock("./components/LocationMap/LocationMap", () => ({
  __esModule: true,
  default: () => <div data-testid="location-map" />,
}));

describe("ContactsPage", () => {
  it("renders the hero heading", () => {
    renderWithIntl(<ContactsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /work together/i,
    );
  });

  it("renders every contact channel with its href and handle", () => {
    renderWithIntl(<ContactsPage />);

    const englishLabels = testMessages("en").common.social as Record<string, string>;
    for (const item of SOCIAL_NAV) {
      const label = englishLabels[item.labelKey];
      const link = screen.getByRole("link", {
        name: `${label}: ${item.handle}`,
      });
      expect(link).toHaveAttribute("href", item.href);
      expect(link).toHaveTextContent(label ?? "");
      expect(link).toHaveTextContent(item.handle);
    }
  });

  it("opens external channels in a new tab but not mailto links", () => {
    renderWithIntl(<ContactsPage />);

    const linkedin = screen.getByRole("link", { name: /^LinkedIn:/ });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    const email = screen.getByRole("link", { name: /^Email:/ });
    expect(email).not.toHaveAttribute("target");
  });

  it("mentions the Kyiv location and renders the map", async () => {
    renderWithIntl(<ContactsPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /work together/i,
    );
    expect(screen.getByText(/kyiv, ukraine/i)).toBeInTheDocument();
    // The map is loaded via next/dynamic, so it resolves after a tick.
    expect(await screen.findByTestId("location-map")).toBeInTheDocument();
  });

  it("renders the Ukrainian copy for the uk locale", () => {
    renderWithIntl(<ContactsPage />, { locale: "uk" });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Працюймо разом",
    );
    expect(screen.getByText("Києві, Україна")).toBeInTheDocument();
  });
});
