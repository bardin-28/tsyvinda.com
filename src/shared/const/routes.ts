export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  BLOG: "/blog",
  BLOG_COVER: "/blog/cover",
  LOGIN: "/login",
  blogPost: (id: string) => `/blog/${id}`,
} as const;

export type Route =
  | "/"
  | "/about"
  | "/blog"
  | "/blog/cover"
  | "/login"
  | `/blog/${string}`;
