import { fireEvent, screen } from "@testing-library/react";

import { readConsent, writeConsent } from "../../consentStorage";
import {
  clearConsentCookie,
  ignorePseudoElementStyles,
  renderWithConsent,
} from "../../testing";
import { CookiePreferences } from "../CookiePreferences/CookiePreferences";
import { CookieBanner } from "./CookieBanner";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

function renderBanner() {
  return renderWithConsent(
    <>
      <CookieBanner />
      <CookiePreferences />
    </>,
  );
}

ignorePseudoElementStyles();

describe("CookieBanner", () => {
  afterEach(clearConsentCookie);

  it("asks a first-time visitor, with a link to the Cookie Policy", () => {
    renderBanner();

    expect(
      screen.getByRole("region", { name: "We value your privacy" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute(
      "href",
      "/cookie-policy",
    );
    expect(screen.getByRole("button", { name: "Accept all" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Reject all" })).toBeVisible();
  });

  it("stays hidden once a choice exists", () => {
    writeConsent({ analytics: false });
    renderBanner();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("Accept all allows everything and closes the banner", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));

    expect(readConsent()).toMatchObject({ analytics: true });
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("Reject all refuses everything optional and closes the banner", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Reject all" }));

    expect(readConsent()).toMatchObject({
      analytics: false,
    });
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("Cookie settings opens the preference center", async () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));

    expect(
      await screen.findByRole("dialog", { name: "Your cookie options" }),
    ).toBeInTheDocument();
  });
});
