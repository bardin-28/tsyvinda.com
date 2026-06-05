// Minimal typings for the Cloudflare Turnstile browser API. Only the surface
// this module actually uses is declared; no @types package is added.

export type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: (error: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  // "execute" defers the challenge until turnstile.execute() is called, which is
  // what makes the widget invisible until a submit triggers it.
  execution?: "render" | "execute";
  // "interaction-only" keeps the widget hidden unless Cloudflare decides a human
  // interaction is required.
  appearance?: "always" | "execute" | "interaction-only";
  retry?: "auto" | "never";
};

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
