import { useEffect } from "react";
import { render, act, waitFor } from "@testing-library/react";

import { useTurnstile } from "./useTurnstile";
import type { TurnstileApi, TurnstileRenderOptions } from "./types";

// Site key is controlled per-test via a live getter, so the hook can be imported
// once (single React instance) while still exercising the enabled/disabled paths.
let mockSiteKey = "";

jest.mock("./constants", () => ({
  get TURNSTILE_SITE_KEY() {
    return mockSiteKey;
  },
  TURNSTILE_EXECUTE_TIMEOUT_MS: 15_000,
  TURNSTILE_TOKEN_FIELD: "cf-turnstile-response",
  TURNSTILE_SCRIPT_SRC:
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
}));

// loadTurnstile is mocked so tests never touch the real Cloudflare script; the
// fake API lets us drive the render callbacks directly.
const fakeApi: jest.Mocked<TurnstileApi> = {
  render: jest.fn(),
  execute: jest.fn(),
  reset: jest.fn(),
  remove: jest.fn(),
};

jest.mock("./loadTurnstile", () => ({
  loadTurnstile: jest.fn(() => Promise.resolve(fakeApi)),
}));

type HookResult = ReturnType<typeof useTurnstile>;

let capturedOptions: TurnstileRenderOptions | undefined;
let latest: HookResult | null = null;

function Harness() {
  const value = useTurnstile();
  const { containerRef } = value;
  // Assigned in an effect (not during render) so the test can read the latest
  // hook result without a render-phase side effect.
  useEffect(() => {
    latest = value;
  });
  return <div ref={containerRef} />;
}

describe("useTurnstile", () => {
  beforeEach(() => {
    mockSiteKey = "";
    capturedOptions = undefined;
    latest = null;
    fakeApi.render.mockReset().mockImplementation((_container, options) => {
      capturedOptions = options;
      return "widget-1";
    });
    fakeApi.execute.mockReset();
    fakeApi.reset.mockReset();
    fakeApi.remove.mockReset();
  });

  it("is disabled and resolves an empty token when no site key is set", async () => {
    render(<Harness />);

    expect(latest?.isEnabled).toBe(false);
    await expect(latest?.execute()).resolves.toBe("");
    expect(fakeApi.render).not.toHaveBeenCalled();
  });

  it("renders the widget and resolves the token from the success callback", async () => {
    mockSiteKey = "test-site-key";
    render(<Harness />);

    expect(latest?.isEnabled).toBe(true);
    await waitFor(() => expect(fakeApi.render).toHaveBeenCalledTimes(1));

    let tokenPromise!: Promise<string>;
    act(() => {
      tokenPromise = latest!.execute();
    });

    expect(fakeApi.reset).toHaveBeenCalledWith("widget-1");
    expect(fakeApi.execute).toHaveBeenCalledWith("widget-1");

    act(() => {
      capturedOptions!.callback("token-123");
    });

    await expect(tokenPromise).resolves.toBe("token-123");
  });

  it("rejects the challenge when the error callback fires", async () => {
    mockSiteKey = "test-site-key";
    render(<Harness />);
    await waitFor(() => expect(fakeApi.render).toHaveBeenCalledTimes(1));

    let tokenPromise!: Promise<string>;
    act(() => {
      tokenPromise = latest!.execute();
    });

    act(() => {
      capturedOptions!["error-callback"]?.("network-error");
    });

    await expect(tokenPromise).rejects.toThrow("Turnstile challenge failed");
  });
});
