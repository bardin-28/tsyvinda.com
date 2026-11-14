import { sitemapEntries } from "@/shared/lib/sitemap/sitemapEntries";
import { buildSitemapXml } from "@/shared/lib/sitemap/sitemapXml";

// Short enough that switching indexing off in the admin empties the sitemap within minutes
export const revalidate = 300;

/** `/sitemap.xml` — plain sitemaps.org XML (see sitemapXml for why it has no hreflang links). */
export async function GET(): Promise<Response> {
  return new Response(buildSitemapXml(await sitemapEntries()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
