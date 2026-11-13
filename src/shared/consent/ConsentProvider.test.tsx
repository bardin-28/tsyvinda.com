import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";

import { ConsentProvider, useConsent } from "./ConsentProvider";
import {
  CONSENT_COOKIE_NAME,
  readConsent,
  writeConsent,
} from "./consentStorage";

function wrapper({ children }: { children: ReactNode }) {
  return <ConsentProvider>{children}</ConsentProvider>;
}

describe("ConsentProvider", () => {
  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
  });

  it("is not ready during server rendering, even with a saved choice", () => {
    writeConsent({ analytics: true });
    function Probe() {
      const { isReady, hasDecided } = useConsent();
      return <span>{`ready:${isReady} decided:${hasDecided}`}</span>;
    }

    const html = renderToString(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    expect(html).toContain("ready:false decided:false");
  });

  it("starts undecided with everything optional off", () => {
    const { result } = renderHook(() => useConsent(), { wrapper });

    expect(result.current.isReady).toBe(true);
    expect(result.current.hasDecided).toBe(false);
    expect(result.current.preferences).toEqual({
      analytics: false,
    });
  });

  it("restores a saved choice", () => {
    writeConsent({ analytics: false });
    const { result } = renderHook(() => useConsent(), { wrapper });

    expect(result.current.hasDecided).toBe(true);
    expect(result.current.preferences).toEqual({
      analytics: false,
    });
  });

  it("acceptAll and rejectAll save and expose the choice", () => {
    const { result } = renderHook(() => useConsent(), { wrapper });

    act(() => result.current.acceptAll());
    expect(result.current.preferences).toEqual({
      analytics: true,
    });
    expect(readConsent()?.analytics).toBe(true);

    act(() => result.current.rejectAll());
    expect(result.current.preferences).toEqual({
      analytics: false,
    });
    expect(readConsent()?.analytics).toBe(false);
  });

  it("opens the preference center, saves a custom choice and closes it", () => {
    const { result } = renderHook(() => useConsent(), { wrapper });

    act(() => result.current.openPreferences());
    expect(result.current.isPreferencesOpen).toBe(true);

    act(() => result.current.savePreferences({ analytics: false }));
    expect(result.current.isPreferencesOpen).toBe(false);
    expect(result.current.hasDecided).toBe(true);
    expect(readConsent()).toMatchObject({ analytics: false });
  });

  it("closing the preference center saves nothing", () => {
    const { result } = renderHook(() => useConsent(), { wrapper });

    act(() => result.current.openPreferences());
    act(() => result.current.closePreferences());

    expect(result.current.isPreferencesOpen).toBe(false);
    expect(result.current.hasDecided).toBe(false);
    expect(readConsent()).toBeNull();
  });

  it("throws outside the provider", () => {
    function Orphan() {
      useConsent();
      return null;
    }
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Orphan />)).toThrow(
      "useConsent must be used within a ConsentProvider",
    );
    expect(screen.queryByText("anything")).toBeNull();
  });
});
