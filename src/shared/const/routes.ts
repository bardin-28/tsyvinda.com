export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
