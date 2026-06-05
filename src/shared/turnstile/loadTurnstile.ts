import { TURNSTILE_SCRIPT_SRC } from "./constants";
import type { TurnstileApi } from "./types";

// Cached so every useTurnstile instance shares a single <script> tag and a
// single in-flight load. Reset to null only on a failed load so a later attempt
// can retry.
let loadPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile can only load in the browser"));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const handleLoad = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        loadPromise = null;
        reject(new Error("Turnstile script loaded but window.turnstile is missing"));
      }
    };

    const handleError = () => {
      loadPromise = null;
      reject(new Error("Failed to load the Turnstile script"));
    };

    // Reuse a script tag if one is already in the document (e.g. added by a
    // previous mount that has not finished loading).
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}

// Test-only helper to clear the cached promise between cases.
export function resetTurnstileLoaderForTests(): void {
  loadPromise = null;
}