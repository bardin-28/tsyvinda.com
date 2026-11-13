/** Cookie categories shown in the consent preference center. */
export const CONSENT_CATEGORIES = {
  /** Required for the site to work (incl. the remembered language); cannot be switched off. */
  NECESSARY: "necessary",
  /** Anonymous visit statistics (Google Analytics). */
  ANALYTICS: "analytics",
} as const;

export type ConsentCategory =
  (typeof CONSENT_CATEGORIES)[keyof typeof CONSENT_CATEGORIES];

/** Categories the visitor can switch on or off. */
export type OptionalConsentCategory = Exclude<
  ConsentCategory,
  typeof CONSENT_CATEGORIES.NECESSARY
>;

export const OPTIONAL_CONSENT_CATEGORIES: readonly OptionalConsentCategory[] = [
  CONSENT_CATEGORIES.ANALYTICS,
];

/** The visitor's choice per optional category (`true` = allowed). */
export type ConsentPreferences = Record<OptionalConsentCategory, boolean>;

/** What the consent cookie holds. */
export type StoredConsent = ConsentPreferences & {
  /** Format/category-set version; an older version means "ask again". */
  version: number;
  /** ISO time of the choice. */
  updatedAt: string;
};
