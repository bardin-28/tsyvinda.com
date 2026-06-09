// Deterministic blog fixtures shared by the mock API server (Node) and the
// Playwright specs (browser assertions). Plain ESM so `node` runs it directly
// with no TypeScript build step.
//
// Image URLs are intentionally empty: PostCard / ArticlePage fall back to a
// "No image" placeholder and author initials, so the suite never fetches a
// remote image and stays fully offline + deterministic.

/**
 * @typedef {Object} PostAuthor
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} profileImageUrl
 *
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} htmlContent
 * @property {string} imageUrl
 * @property {PostAuthor} author
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const author = {
  id: "author-1",
  firstName: "Vladyslav",
  lastName: "Tsyvinda",
  profileImageUrl: "",
};

/** @type {Post[]} */
export const POSTS = [
  {
    id: "post-1",
    slug: "first-post",
    title: "Shipping Production-Grade Next.js",
    description: "How this site is built and deployed.",
    htmlContent: "<p>First post body paragraph for e2e coverage.</p>",
    imageUrl: "",
    author,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "post-2",
    slug: "second-post",
    title: "Type-Safe Forms with Formik and Zod",
    description: "Validation patterns used across the app.",
    htmlContent: "<p>Second post body paragraph for e2e coverage.</p>",
    imageUrl: "",
    author,
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
  },
];

/**
 * Build the paginated list response shape returned by `GET /posts`.
 * @param {Post[]} items
 * @returns {{ items: Post[], nextCursor: string | null }}
 */
export function buildPostsPage(items = POSTS) {
  return { items, nextCursor: null };
}

/**
 * @param {string} slug
 * @returns {Post | undefined}
 */
export function findPostBySlug(slug) {
  return POSTS.find((post) => post.slug === slug);
}
