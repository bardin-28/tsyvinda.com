import { useCallback, useEffect, useRef } from "react";

import { TURNSTILE_EXECUTE_TIMEOUT_MS, TURNSTILE_SITE_KEY } from "./constants";
import { loadTurnstile } from "./loadTurnstile";
import type { TurnstileApi } from "./types";

// One challenge can be awaiting a token at a time; this holds its resolvers and
// the safety timeout so callbacks can settle it from outside the promise.
type PendingChallenge = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

type UseTurnstileResult = {
  // Attach to an (invisible) element the widget renders into.
  containerRef: React.RefObject<HTMLDivElement | null>;
  // Runs the challenge and resolves the verification token. Resolves "" when the
  // check is disabled (no site key configured).
  execute: () => Promise<string>;
  // Clears any used/expired token from the widget.
  reset: () => void;
  // False when no site key is configured, so callers can branch if needed.
  isEnabled: boolean;
};

export function useTurnstile(): UseTurnstileResult {
  const isEnabled = TURNSTILE_SITE_KEY.length > 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingChallenge | null>(null);

  // Reject and clear the in-flight challenge, if any.
  const failPending = useCallback((error: Error) => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    pendingRef.current = null;
    pending.reject(error);
  }, []);

  // Resolve and clear the in-flight challenge with a token.
  const resolvePending = useCallback((token: string) => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    pendingRef.current = null;
    pending.resolve(token);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let cancelled = false;

    loadTurnstile()
      .then((api) => {
        if (cancelled || !containerRef.current || widgetIdRef.current) return;
        apiRef.current = api;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          execution: "execute",
          appearance: "interaction-only",
          callback: (token) => resolvePending(token),
          "error-callback": () => failPending(new Error("Turnstile challenge failed")),
          "expired-callback": () => failPending(new Error("Turnstile challenge expired")),
          "timeout-callback": () => failPending(new Error("Turnstile challenge timed out")),
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // A load failure only matters when a challenge is awaiting it.
        failPending(error instanceof Error ? error : new Error("Turnstile failed to load"));
      });

    return () => {
      cancelled = true;
      const api = apiRef.current;
      const widgetId = widgetIdRef.current;
      if (api && widgetId) api.remove(widgetId);
      widgetIdRef.current = null;
      apiRef.current = null;
      failPending(new Error("Turnstile widget was unmounted"));
    };
  }, [isEnabled, failPending, resolvePending]);

  const execute = useCallback((): Promise<string> => {
    // No key configured: resolve empty so forms still submit in keyless dev,
    // tests, and Storybook.
    if (!isEnabled) return Promise.resolve("");

    const api = apiRef.current;
    const widgetId = widgetIdRef.current;
    if (!api || !widgetId) {
      return Promise.reject(new Error("Turnstile is not ready yet"));
    }

    // Abandon any earlier challenge still awaiting a token.
    failPending(new Error("Turnstile challenge superseded"));

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingRef.current = null;
        reject(new Error("Turnstile challenge timed out"));
      }, TURNSTILE_EXECUTE_TIMEOUT_MS);

      pendingRef.current = { resolve, reject, timeoutId };

      // Clear any prior token, then trigger the (invisible) challenge.
      api.reset(widgetId);
      api.execute(widgetId);
    });
  }, [isEnabled, failPending]);

  const reset = useCallback(() => {
    const api = apiRef.current;
    const widgetId = widgetIdRef.current;
    if (api && widgetId) api.reset(widgetId);
  }, []);

  return { containerRef, execute, reset, isEnabled };
}
