import { screen } from "@testing-library/react";

import type { Block } from "@/shared/cms";
import { SOCIAL_NAV } from "@/shared/const";
import { renderWithIntl, testMessages } from "@/shared/testing/intl";

import { ContactsView } from "./ContactsView";

// The map is a client-only Leaflet component pulled in via next/dynamic; stub it
// so the view test stays in jsdom and focuses on the markup.
jest.mock("./components/LocationMap/LocationMap", () => ({
  __esModule: true,
  default: ({ label }: { label?: string }) => (
    <div data-testid="location-map" aria-label={label} />
  ),
}));

const blocks: Block[] = [
  {
    id: "hero",
    type: "contactsHero",
    anchor: null,
    data: {
      title: "Let’s <accent>work together</accent>",
      lead: "Based in <accent>Kyiv, Ukraine</accent>.<br></br>Reach me below.",
      mapLabel: "Map of Kyiv",
    },
  },
  { id: "channels", type: "contactChannels", anchor: null, data: {} },
];

describe("ContactsView", () => {
  it("renders the CMS hero with highlighted parts and the map label", async () => {
    renderWithIntl(<ContactsView blocks={blocks} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Let’s work together");
    expect(screen.getByText("work together").tagName).toBe("SPAN");
    expect(screen.getByText("Kyiv, Ukraine")).toBeInTheDocument();
    expect(await screen.findByTestId("location-map")).toHaveAttribute(
      "aria-label",
      "Map of Kyiv",
    );
  });

  it("renders every contact channel with its href and handle", () => {
    renderWithIntl(<ContactsView blocks={blocks} />);
    const englishLabels = testMessages("en").common.social as Record<
      string,
      string
    >;
    for (const item of SOCIAL_NAV) {
      const label = englishLabels[item.labelKey];
      const link = screen.getByRole("link", {
        name: `${label}: ${item.handle}`,
      });
      expect(link).toHaveAttribute("href", item.href);
    }
  });

  it("opens external channels in a new tab but not mailto links", () => {
    renderWithIntl(<ContactsView blocks={blocks} />);
    const linkedin = screen.getByRole("link", { name: /^LinkedIn:/ });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /^Email:/ })).not.toHaveAttribute(
      "target",
    );
  });

  it("follows the editor's order and skips sections it does not know", () => {
    renderWithIntl(<ContactsView blocks={[blocks[1]!]} />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBe(SOCIAL_NAV.length);
  });
});
