export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACTS: "/contacts",
  BLOG: "/blog",
  BLOG_COVER: "/blog/cover",
  LOGIN: "/login",
  RESET_PASSWORD: "/reset-password",
  PROFILE: "/profile",
  blogPost: (slug: string) => `/blog/${slug}`,
} as const;

export type Route =
  | "/"
  | "/about"
  | "/contacts"
  | "/blog"
  | "/blog/cover"
  | "/login"
  | "/reset-password"
  | "/profile"
  | `/blog/${string}`;
