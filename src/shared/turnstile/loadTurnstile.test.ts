import { TURNSTILE_SCRIPT_SRC } from "./constants";
import { loadTurnstile, resetTurnstileLoaderForTests } from "./loadTurnstile";
import type { TurnstileApi } from "./types";

function makeApi(): TurnstileApi {
  return {
    render: jest.fn(() => "widget-id"),
    execute: jest.fn(),
    reset: jest.fn(),
    remove: jest.fn(),
  };
}

function turnstileScripts(): NodeListOf<HTMLScriptElement> {
  return document.head.querySelectorAll<HTMLScriptElement>(
    `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
  );
}

describe("loadTurnstile", () => {
  afterEach(() => {
    resetTurnstileLoaderForTests();
    turnstileScripts().forEach((script) => script.remove());
    delete (window as { turnstile?: TurnstileApi }).turnstile;
  });

  it("resolves immediately when window.turnstile already exists", async () => {
    const api = makeApi();
    window.turnstile = api;

    await expect(loadTurnstile()).resolves.toBe(api);
    expect(turnstileScripts()).toHaveLength(0);
  });

  it("appends a single script and shares one promise across calls", async () => {
    const first = loadTurnstile();
    const second = loadTurnstile();

    expect(first).toBe(second);
    expect(turnstileScripts()).toHaveLength(1);

    // Cloudflare attaches its API, then the script fires its load event.
    window.turnstile = makeApi();
    turnstileScripts()[0].dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(window.turnstile);
  });

  it("rejects and clears the cache when the script fails to load", async () => {
    const promise = loadTurnstile();
    turnstileScripts()[0].dispatchEvent(new Event("error"));

    await expect(promise).rejects.toThrow("Failed to load the Turnstile script");

    // After a failure a fresh call starts a new load rather than reusing it.
    const retry = loadTurnstile();
    expect(retry).not.toBe(promise);
  });
});