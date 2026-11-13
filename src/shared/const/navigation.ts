import type { PageKey } from "@/shared/cms/schemas";

import { ROUTES } from "./routes";

/** Key under `common.nav` in the message files */
export type NavLabelKey =
  "home" | "about" | "blog" | "contacts" | "privacyPolicy" | "cookiePolicy";

/**
 * A link to a CMS page. Its address comes from the CMS route map (editable per language in the
 * admin), so components resolve it with `usePaths().page(pageKey)`.
 */
export type NavLink = {
  labelKey: NavLabelKey;
  pageKey: PageKey;
};

/**
 * Primary page links shown in the shared header menu and footer.
 * Excludes the blog cover generator and the login route (login is handled
 * as a distinct auth action inside the header menu).
 */
export const NAV_LINKS: NavLink[] = [
  { labelKey: "home", pageKey: "home" },
  { labelKey: "about", pageKey: "about" },
  { labelKey: "blog", pageKey: "blog" },
  { labelKey: "contacts", pageKey: "contacts" },
];

/**
 * Legal links shown in the footer only — kept out of NAV_LINKS so the header
 * menu stays limited to the primary pages.
 */
export const LEGAL_LINKS: NavLink[] = [
  { labelKey: "privacyPolicy", pageKey: "privacy-policy" },
  { labelKey: "cookiePolicy", pageKey: "cookie-policy" },
];

/**
 * Routes where the shared chrome (SiteHeader / SiteFooter) is suppressed.
 * Matched by exact path or as a nested prefix.
 */
export const CHROME_HIDDEN_ROUTES: string[] = [ROUTES.BLOG_COVER];

/**
 * Returns true when the shared header/footer must be hidden for `pathname` (without the
 * language prefix, as next-intl's usePathname returns it).
 */
export function isChromeHidden(pathname: string): boolean {
  return CHROME_HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
