/**
 * Topics listed under the blog feed. Rendered server-side so the page always ships meaningful
 * content in the HTML — even when the posts API is unreachable and the feed renders empty
 * (which Google reports as a soft 404 on a thin listing page). Texts: `blog.topics.<key>`.
 */
export const BLOG_TOPIC_KEYS = [
  "react",
  "typescript",
  "architecture",
  "performance",
  "testing",
  "team",
] as const;

export type BlogTopicKey = (typeof BLOG_TOPIC_KEYS)[number];
