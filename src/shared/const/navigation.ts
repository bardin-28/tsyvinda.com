import { ROUTES } from "./routes";

export type NavLink = {
  label: string;
  href: string;
};

/**
 * Primary page links shown in the shared header menu and footer.
 * Excludes the blog cover generator and the login route (login is handled
 * as a distinct auth action inside the header menu).
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "About", href: ROUTES.ABOUT },
  { label: "Blog", href: ROUTES.BLOG },
];

/**
 * Routes where the shared chrome (SiteHeader / SiteFooter) is suppressed.
 * Matched by exact path or as a nested prefix.
 */
export const CHROME_HIDDEN_ROUTES: string[] = [ROUTES.BLOG_COVER];

/**
 * Returns true when the shared header/footer must be hidden for `pathname`.
 */
export function isChromeHidden(pathname: string): boolean {
  return CHROME_HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
