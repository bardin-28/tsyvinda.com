export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACTS: "/contacts",
  BLOG: "/blog",
  BLOG_COVER: "/blog/cover",
  LOGIN: "/login",
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
  | "/profile"
  | `/blog/${string}`;
