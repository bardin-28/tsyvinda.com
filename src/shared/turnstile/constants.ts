// Public site key, injected at build time. Must stay NEXT_PUBLIC_-prefixed so it
// is readable in the browser, where the widget renders. Empty when unset, which
// disables the check (see useTurnstile).
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

// Explicit render mode: the script does not auto-render widgets, so useTurnstile
// controls when each widget is created.
export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Field name Cloudflare's siteverify expects, and the body/form key the frontend
// sends. Shared contract with the backend that verifies the token.
export const TURNSTILE_TOKEN_FIELD = "cf-turnstile-response";

// Upper bound on how long execute() waits for a token before rejecting, so a
// stuck challenge never hangs a form submit indefinitely.
export const TURNSTILE_EXECUTE_TIMEOUT_MS = 15_000;