export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACTS: "/contacts",
  BLOG: "/blog",
  BLOG_COVER: "/blog/cover",
  LOGIN: "/login",
  REGISTER: "/registration",
  RESET_PASSWORD: "/reset-password",
  PROFILE: "/profile",
  PRIVACY_POLICY: "/privacy-policy",
  COOKIE_POLICY: "/cookie-policy",
  blogPost: (slug: string) => `/blog/${slug}`,
} as const;

export type Route =
  | "/"
  | "/about"
  | "/contacts"
  | "/blog"
  | "/blog/cover"
  | "/login"
  | "/registration"
  | "/reset-password"
  | "/profile"
  | "/privacy-policy"
  | "/cookie-policy"
  | `/blog/${string}`;
