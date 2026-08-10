/**
 * Static copy for the blog index. Rendered server-side below the post feed so
 * the page always ships meaningful content in the HTML — even when the posts
 * API is unreachable and the feed renders empty (which Google reports as a
 * soft 404 on a thin listing page).
 */

export type BlogTopic = {
  title: string;
  description: string;
};

export const BLOG_TOPICS_HEADING = "What I write about";

export const BLOG_TOPICS_INTRO =
  "Posts here are practical rather than theoretical: problems hit on real client projects, the options weighed, what got chosen, and what it cost. Expect code, numbers, and the occasional retraction when a decision aged badly. Published when there is something worth writing down, not on a schedule.";

export const BLOG_TOPICS: BlogTopic[] = [
  {
    title: "React & Next.js in production",
    description:
      "App Router patterns, server and client component boundaries, data fetching, caching and revalidation, and the trade-offs behind rendering strategies on real products.",
  },
  {
    title: "TypeScript at scale",
    description:
      "Typing API layers and shared contracts, keeping generics readable, and the conventions that keep a growing codebase reviewable instead of clever.",
  },
  {
    title: "Frontend architecture",
    description:
      "Folder conventions, state management with Redux Toolkit and React Query, design systems in Storybook, and where abstractions actually pay for themselves.",
  },
  {
    title: "Performance & Core Web Vitals",
    description:
      "Bundle budgets, image and font strategy, animation without jank, WebGL scenes that clean up after themselves, and measuring LCP, INP, and CLS on real devices.",
  },
  {
    title: "Testing & delivery",
    description:
      "Jest and Testing Library where they earn their keep, end-to-end coverage of critical flows, Docker builds, and CI pipelines that stay fast enough to trust.",
  },
  {
    title: "Team & engineering practice",
    description:
      "Lessons from leading frontend teams — code review that catches real problems, estimation that survives contact with a deadline, and shipping without burning the team.",
  },
];