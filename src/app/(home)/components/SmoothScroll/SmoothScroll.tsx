"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ReactLenis } from "lenis/react";
// Required for `root` mode: resets `html`/`body` height (our globals.css pins
// them to 100%, which otherwise leaves Lenis with a zero scroll range = locked).
import "lenis/dist/lenis.css";

/**
 * Lenis tuning for the home page — eased momentum scrolling. `lerp` is the
 * per-frame smoothing factor; lower = longer glide. Touch is left on the native
 * scroller so mobile keeps its expected inertia.
 */
const LENIS_OPTIONS = {
  lerp: 0.09,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
} as const;

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Wraps the home page in a global Lenis instance for smooth momentum scrolling.
 * Honors `prefers-reduced-motion`: when reduced, it renders children untouched
 * so the browser's native (instant) scroll is used. `root` mode drives the
 * window scroller, so code reading `window.scrollY` (the oloid scene) keeps
 * working — and gets smoothed scroll values.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
