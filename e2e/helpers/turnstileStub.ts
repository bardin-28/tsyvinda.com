import type { Page } from "@playwright/test";

// Token the stubbed widget resolves on execute(). Asserted in the spec to prove
// the value flows from the Turnstile callback into the login request body.
export const STUB_TURNSTILE_TOKEN = "e2e-turnstile-token";

/**
 * Install a fake `window.turnstile` before any page script runs. loadTurnstile()
 * sees window.turnstile already present and resolves it immediately, so the real
 * Cloudflare script is never fetched (offline, deterministic). render() captures
 * the success callback; execute() invokes it with STUB_TURNSTILE_TOKEN — mirroring
 * the explicit-execution invisible widget the app configures.
 */
type StubRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
};

type TurnstileStub = {
  render: (container: HTMLElement, options: StubRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

export async function installTurnstileStub(page: Page): Promise<void> {
  await page.addInitScript((token: string) => {
    const callbacks = new Map<string, (value: string) => void>();
    let nextId = 0;

    const stub: TurnstileStub = {
      render: (_container: HTMLElement, options: StubRenderOptions) => {
        const widgetId = `stub-widget-${nextId}`;
        nextId += 1;
        callbacks.set(widgetId, options.callback);
        return widgetId;
      },
      execute: (widgetId: string) => {
        const callback = callbacks.get(widgetId);
        if (callback) callback(token);
      },
      reset: () => {},
      remove: (widgetId: string) => {
        callbacks.delete(widgetId);
      },
    };

    (window as unknown as { turnstile: TurnstileStub }).turnstile = stub;
  }, STUB_TURNSTILE_TOKEN);
}
