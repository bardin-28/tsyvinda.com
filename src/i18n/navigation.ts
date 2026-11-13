import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/** Locale-aware Link / router: hrefs are unprefixed ("/blog"), the current language is added. */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
