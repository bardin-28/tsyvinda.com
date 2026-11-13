import { CONSENT_CATEGORIES, CONSENT_COOKIE_NAME } from "@/shared/consent";
import type { ConsentCategory } from "@/shared/consent";
import { LOCALE_STORAGE_KEY } from "@/i18n/locales";

/** Key under `cookies.list.rows` holding the translated purpose and duration. */
export type CookieRowId =
  | "consent"
  | "locale"
  | "access"
  | "refresh"
  | "hasSession"
  | "cloudflare"
  | "turnstile"
  | "ga"
  | "gaSession";

export type CookieRow = {
  id: CookieRowId;
  /** Cookie / storage key exactly as it appears in the browser. */
  name: string;
  provider: string;
  category: ConsentCategory;
};

/**
 * Every cookie and storage key the website uses. Keep in sync with the code that sets them
 * (consent module, auth API, Cloudflare, Google Analytics) and bump COOKIE_POLICY_UPDATED_AT_ISO.
 */
export const COOKIE_ROWS: readonly CookieRow[] = [
  {
    id: "consent",
    name: CONSENT_COOKIE_NAME,
    provider: "tsyvinda.com",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "locale",
    name: `${LOCALE_STORAGE_KEY} (localStorage)`,
    provider: "tsyvinda.com",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "access",
    name: "access",
    provider: "tsyvinda.com",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "refresh",
    name: "refresh",
    provider: "tsyvinda.com",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "hasSession",
    name: "has_session",
    provider: "tsyvinda.com",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "cloudflare",
    name: "__cf_bm, cf_clearance",
    provider: "Cloudflare",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "turnstile",
    name: "Turnstile",
    provider: "Cloudflare",
    category: CONSENT_CATEGORIES.NECESSARY,
  },
  {
    id: "ga",
    name: "_ga",
    provider: "Google",
    category: CONSENT_CATEGORIES.ANALYTICS,
  },
  {
    id: "gaSession",
    name: "_ga_<ID>",
    provider: "Google",
    category: CONSENT_CATEGORIES.ANALYTICS,
  },
];

/** Third parties' own policies, linked from the "Third parties" section. */
export const THIRD_PARTY_POLICY_URLS = {
  google: "https://policies.google.com/technologies/cookies",
  cloudflare: "https://www.cloudflare.com/cookie-policy/",
} as const;
