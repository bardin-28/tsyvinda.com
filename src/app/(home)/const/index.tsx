import { EXPERIENCE, INDUSTRIES, RECOMMENDATIONS } from "@/app/about/const";
import type { Recommendation, Role } from "@/app/about/const";

export const NAME_WORDS = ["Vladyslav", "Tsyvinda"];

export const ROLE_PRIMARY = "Software Engineer";
export const ROLE_SECONDARY = "Front-end Lead at Tallium Inc.";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Curated home-page copy. The heavy data arrays are imported from the About
 * route so there is a single source of truth; here we only select condensed
 * subsets and write the home-specific lead lines.
 */
export const ABOUT_TEASER_LEAD =
  "Six years building scalable products across MedTech, FinTech, PropTech, TravelTech and EdTech — from frontend architecture to lead delivery.";

/** Top three roles shown on the home timeline; full history lives on /about. */
export const FEATURED_EXPERIENCE: Role[] = EXPERIENCE.slice(0, 3);

/** Single featured recommendation; the rest live on /about. */
export const FEATURED_RECOMMENDATION: Recommendation = RECOMMENDATIONS[0];

export { INDUSTRIES };

export type HomeSection = {
  /** Two-digit eyebrow shown above the section title. */
  tag: string;
  title: string;
  lede: string;
};

export const SECTION_ABOUT: HomeSection = {
  tag: "01",
  title: "Who I am",
  lede: "A frontend lead who ships production-grade React and Next.js at scale.",
};

export const SECTION_EXPERIENCE: HomeSection = {
  tag: "02",
  title: "Where I've worked",
  lede: "Recent roles across lead, frontend, and full-stack delivery.",
};

export const SECTION_RECOMMENDATION: HomeSection = {
  tag: "03",
  title: "What people say",
  lede: "A word from someone I've worked closely with.",
};

export const SECTION_CONTACT: HomeSection = {
  tag: "04",
  title: "Let's talk",
  lede: "Open to new projects — reach me on any channel.",
};

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
