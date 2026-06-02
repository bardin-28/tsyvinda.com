/**
 * Converts an absolute upload URL (e.g. https://api.tsyvinda.com/uploads/posts/x.jpg)
 * to a root-relative path (/uploads/posts/x.jpg) so requests are proxied through
 * the Next.js server and the API origin is never exposed to the client.
 *
 * Already-relative paths and non-HTTP values are returned unchanged.
 */
export function toProxiedUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
