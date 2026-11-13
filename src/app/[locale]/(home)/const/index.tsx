import {
  EXPERIENCE,
  INDUSTRIES,
  RECOMMENDATIONS,
} from "@/app/[locale]/about/const";
import type { Recommendation, Role } from "@/app/[locale]/about/const";
import type { Locale } from "@/i18n/locales";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Home-page content selections. The heavy data arrays are imported from the About
 * route so there is a single source of truth; here we only select condensed
 * subsets. Home-specific copy lives in the `home` messages.
 */

/** How many of the latest roles the home timeline shows; full history lives on /about. */
const FEATURED_ROLE_COUNT = 3;

/** Top roles shown on the home timeline, per language. */
export const FEATURED_EXPERIENCE: Record<Locale, Role[]> = {
  en: EXPERIENCE.en.slice(0, FEATURED_ROLE_COUNT),
  uk: EXPERIENCE.uk.slice(0, FEATURED_ROLE_COUNT),
};

/** Single featured recommendation per language; the rest live on /about. */
export const FEATURED_RECOMMENDATION: Record<Locale, Recommendation> = {
  en: RECOMMENDATIONS.en[0],
  uk: RECOMMENDATIONS.uk[0],
};

export { INDUSTRIES };

/** Two-digit eyebrows shown above each home section title. */
export const SECTION_TAGS = {
  about: "01",
  experience: "02",
  recommendation: "03",
  contact: "04",
} as const;

export const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const wordVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export const roleVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.15 },
  },
};

/** Shared reveal variants for scroll-triggered sections. */
export const sectionContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const sectionItemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};
