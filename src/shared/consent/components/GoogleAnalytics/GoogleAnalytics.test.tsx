import { fireEvent, screen } from "@testing-library/react";

import { useConsent } from "../../ConsentProvider";
import { clearGaDisabled, readGaDisabled } from "../../analyticsCookies";
import { writeConsent } from "../../consentStorage";
import { clearConsentCookie, renderWithConsent } from "../../testing";
import { GoogleAnalytics } from "./GoogleAnalytics";

// next/script injects tags itself; a plain <script> marker is enough to see what would load
jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ id, src }: { id?: string; src?: string }) => (
    <script data-testid={id ?? "gtag-src"} data-src={src} />
  ),
}));

const GA_ID = "G-TEST123";

/** Accept / reject through the context, like the banner buttons do. */
function ConsentButtons() {
  const { acceptAll, rejectAll } = useConsent();
  return (
    <>
      <button type="button" onClick={acceptAll}>
        accept
      </button>
      <button type="button" onClick={rejectAll}>
        reject
      </button>
    </>
  );
}

function renderAnalytics() {
  return renderWithConsent(
    <>
      <ConsentButtons />
      <GoogleAnalytics gaId={GA_ID} />
    </>,
  );
}

describe("GoogleAnalytics", () => {
  afterEach(() => {
    clearConsentCookie();
    document.cookie = "_ga=; Max-Age=0; Path=/";
    document.cookie = "_ga_TEST123=; Max-Age=0; Path=/";
    clearGaDisabled(GA_ID);
  });

  it("loads nothing before the visitor decides", () => {
    renderAnalytics();
    expect(screen.queryByTestId("gtag-src")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ga-init")).not.toBeInTheDocument();
  });

  it("loads nothing when analytics was rejected", () => {
    writeConsent({ analytics: false });
    renderAnalytics();
    expect(screen.queryByTestId("gtag-src")).not.toBeInTheDocument();
  });

  it("loads gtag once analytics is allowed", () => {
    writeConsent({ analytics: true });
    renderAnalytics();

    expect(screen.getByTestId("gtag-src")).toHaveAttribute(
      "data-src",
      `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
    );
    expect(screen.getByTestId("ga-init")).toBeInTheDocument();
    expect(readGaDisabled(GA_ID)).toBe(false);
  });

  it("starts loading right after Accept all, without a reload", () => {
    renderAnalytics();
    fireEvent.click(screen.getByRole("button", { name: "accept" }));
    expect(screen.getByTestId("gtag-src")).toBeInTheDocument();
  });

  it("withdrawal stops gtag and deletes the GA cookies", () => {
    writeConsent({ analytics: true });
    renderAnalytics();
    document.cookie = "_ga=GA1.1.123.456; Path=/";
    document.cookie = "_ga_TEST123=GS1.1.789; Path=/";

    fireEvent.click(screen.getByRole("button", { name: "reject" }));

    expect(screen.queryByTestId("gtag-src")).not.toBeInTheDocument();
    expect(readGaDisabled(GA_ID)).toBe(true);
    expect(document.cookie).not.toContain("_ga");
  });
});
