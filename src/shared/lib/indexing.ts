import { getSiteSettings } from "@/api/siteSettings";

/** How long the indexing flag is reused before asking the API again. */
export const INDEXING_CACHE_MS = 60_000;

/** The live site was indexed before the admin switch existed; keep that if the API is unknown. */
const DEFAULT_INDEXING_ENABLED = true;

type CachedFlag = { value: boolean; fetchedAt: number };

let cached: CachedFlag | null = null;

/**
 * Whether search engines may index the website (admin: Settings → General). Read on every page
 * request by the proxy, so it is cached in memory for a minute. If the API cannot be reached,
 * the last known value is kept (or "on" when there is none) instead of failing the page.
 */
export async function isIndexingEnabled(
  now: number = Date.now(),
): Promise<boolean> {
  if (cached && now - cached.fetchedAt < INDEXING_CACHE_MS) return cached.value;
  try {
    const settings = await getSiteSettings();
    cached = { value: settings.indexingEnabled, fetchedAt: now };
  } catch {
    // Retry on the next request rather than pinning a guess for a whole minute
    return cached?.value ?? DEFAULT_INDEXING_ENABLED;
  }
  return cached.value;
}

/** Test helper: forget the cached flag. */
export function resetIndexingCache(): void {
  cached = null;
}
