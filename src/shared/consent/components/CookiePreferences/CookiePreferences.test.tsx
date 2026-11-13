import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { useConsent } from "../../ConsentProvider";
import { readConsent, writeConsent } from "../../consentStorage";
import {
  clearConsentCookie,
  ignorePseudoElementStyles,
  renderWithConsent,
} from "../../testing";
import { CookiePreferences } from "./CookiePreferences";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

/** Opens the dialog through the context, like the banner / footer buttons do. */
function OpenButton() {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences}>
      open
    </button>
  );
}

async function openPreferences(): Promise<HTMLElement> {
  renderWithConsent(
    <>
      <OpenButton />
      <CookiePreferences />
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "open" }));
  return screen.findByRole("dialog", { name: "Your cookie options" });
}

ignorePseudoElementStyles();

describe("CookiePreferences", () => {
  afterEach(clearConsentCookie);

  it("lists the two categories; necessary is always active, analytics starts off", async () => {
    await openPreferences();

    expect(screen.getByText("Strictly necessary cookies")).toBeInTheDocument();
    expect(screen.getByText("Always active")).toBeInTheDocument();
    expect(screen.queryByText("Functional cookies")).not.toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(1);
    expect(
      screen.getByRole("switch", { name: "Analytics cookies" }),
    ).not.toBeChecked();
  });

  it("expands a category to show its description", async () => {
    await openPreferences();
    const toggle = screen.getByRole("button", { name: /Analytics cookies/ });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/Google Analytics counts visits/)).toHaveAttribute(
      "hidden",
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/Google Analytics counts visits/),
    ).not.toHaveAttribute("hidden");
  });

  it("Confirm my choices saves exactly the switched categories", async () => {
    await openPreferences();
    fireEvent.click(screen.getByRole("switch", { name: "Analytics cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm my choices" }));

    expect(readConsent()).toMatchObject({ analytics: true });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("Allow all and Reject all save without confirming", async () => {
    await openPreferences();
    fireEvent.click(screen.getByRole("button", { name: "Allow all" }));
    expect(readConsent()).toMatchObject({ analytics: true });

    fireEvent.click(screen.getByRole("button", { name: "open" }));
    await screen.findByRole("dialog", { name: "Your cookie options" });
    fireEvent.click(screen.getByRole("button", { name: "Reject all" }));
    expect(readConsent()).toMatchObject({
      analytics: false,
    });
  });

  it("closing with × saves nothing", async () => {
    await openPreferences();
    fireEvent.click(screen.getByRole("switch", { name: "Analytics cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(readConsent()).toBeNull();
  });

  it("starts from the saved choice when reopened", async () => {
    writeConsent({ analytics: false });
    await openPreferences();
    expect(
      screen.getByRole("switch", { name: "Analytics cookies" }),
    ).not.toBeChecked();
    await act(async () => undefined);
  });
});
