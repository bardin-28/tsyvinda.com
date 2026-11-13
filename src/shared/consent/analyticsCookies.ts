/** Google Analytics cookies: `_ga` and `_ga_<container>` (listed in the Cookie Policy). */
const ANALYTICS_COOKIE_PREFIX = "_ga";

/** Window flag that makes an already loaded gtag stop sending hits for `gaId`. */
export function gaDisableFlag(gaId: string): string {
  return `ga-disable-${gaId}`;
}

/** gtag reads `window['ga-disable-<ID>']`; the key is dynamic, so it is not on the Window type. */
type WindowWithGaFlags = Record<string, unknown>;

function gaFlags(): WindowWithGaFlags {
  return window as unknown as WindowWithGaFlags;
}

/** Turns hit sending of an already loaded gtag off (`true`) or back on (`false`). */
export function setGaDisabled(gaId: string, isDisabled: boolean): void {
  gaFlags()[gaDisableFlag(gaId)] = isDisabled;
}

/** Current disable flag (undefined when never set). */
export function readGaDisabled(gaId: string): boolean | undefined {
  return gaFlags()[gaDisableFlag(gaId)] as boolean | undefined;
}

/** Removes the disable flag (tests). */
export function clearGaDisabled(gaId: string): void {
  delete gaFlags()[gaDisableFlag(gaId)];
}

/**
 * Domains a cookie for `hostname` may have been set on. GA writes to the top-most domain it can
 * (`.tsyvinda.com`), so every parent domain is tried, with and without the leading dot.
 */
function cookieDomainCandidates(hostname: string): string[] {
  const labels = hostname.split(".");
  const domains: string[] = [];
  for (let index = 0; index < labels.length - 1; index += 1) {
    const domain = labels.slice(index).join(".");
    domains.push(domain, `.${domain}`);
  }
  return domains;
}

/** Deletes every GA cookie this page can see (consent withdrawn). */
export function removeAnalyticsCookies(): void {
  const cookieNames = document.cookie
    .split("; ")
    .map((cookie) => cookie.split("=")[0])
    .filter((name) => name.startsWith(ANALYTICS_COOKIE_PREFIX));
  const domains = cookieDomainCandidates(window.location.hostname);

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`;
    }
  }
}
