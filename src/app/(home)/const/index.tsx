export const NAME_WORDS = ["Vladyslav", "Tsyvinda"];

export const ROLE_PRIMARY = "Software Engineer";
export const ROLE_SECONDARY = "Front-end Lead at Tallium Inc.";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
