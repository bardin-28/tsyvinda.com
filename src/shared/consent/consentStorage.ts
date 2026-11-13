import { getCookie } from "@/shared/lib/cookies";

import {
  OPTIONAL_CONSENT_CATEGORIES,
  type ConsentPreferences,
  type StoredConsent,
} from "./types";

/** First-party cookie holding the visitor's choice (listed in the Cookie Policy). */
export const CONSENT_COOKIE_NAME = "cookie_consent";

/**
 * Bump when the categories or what they cover change: stored choices with an older version are
 * ignored, so every visitor is asked again.
 */
export const CONSENT_VERSION = 1;

/** About 6 months; after that the banner asks again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export const ALL_ACCEPTED: ConsentPreferences = {
  analytics: true,
};

/** Also the effective state before the visitor decides: nothing optional runs. */
export const ALL_REJECTED: ConsentPreferences = {
  analytics: false,
};

function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.version === CONSENT_VERSION &&
    typeof candidate.updatedAt === "string" &&
    OPTIONAL_CONSENT_CATEGORIES.every(
      (category) => typeof candidate[category] === "boolean",
    )
  );
}

/** Parses the consent cookie value; null when empty, malformed or from an older version. */
export function parseConsent(raw: string | null): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** The saved choice, or null when there is none (or it is malformed / from an older version). */
export function readConsent(): StoredConsent | null {
  return parseConsent(getCookie(CONSENT_COOKIE_NAME));
}

/** Raw consent cookie value ("" when unset): a stable snapshot for useSyncExternalStore. */
export function readConsentCookieValue(): string {
  return getCookie(CONSENT_COOKIE_NAME) ?? "";
}

const consentListeners = new Set<() => void>();

/** Notifies subscribers (the provider) whenever writeConsent saves a new choice. */
export function subscribeToConsent(listener: () => void): () => void {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

/** Saves the choice in the consent cookie and returns what was stored. */
export function writeConsent(
  preferences: ConsentPreferences,
  now: Date = new Date(),
): StoredConsent {
  const consent: StoredConsent = {
    version: CONSENT_VERSION,
    analytics: preferences.analytics,
    updatedAt: now.toISOString(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  consentListeners.forEach((listener) => listener());
  return consent;
}
