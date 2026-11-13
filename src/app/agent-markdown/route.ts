import { resolvePageMarkdown } from "@/shared/lib/markdown/resolvePageMarkdown";
import { MARKDOWN_PATH_HEADER } from "@/shared/lib/markdown/markdownRoute";

/**
 * Markdown version of a public page for AI agents. Not linked anywhere: `src/proxy.ts` rewrites
 * a page request here when its `Accept` header asks for `text/markdown`, passing the requested
 * path in a request header (route handlers still see the original URL after a rewrite, and the
 * proxy overwrites any client-sent value). The page URL stays the same; only the representation
 * changes.
 */

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // Same URL serves HTML or Markdown depending on Accept
  Vary: "Accept",
  // The HTML page is the indexable version
  "X-Robots-Tag": "noindex",
};

export async function GET(request: Request): Promise<Response> {
  const pathname = request.headers.get(MARKDOWN_PATH_HEADER) ?? "/";
  const result = await resolvePageMarkdown(pathname);

  if (result.kind === "redirect") {
    return new Response(null, {
      status: result.permanent ? 308 : 307,
      headers: { Location: result.location, Vary: "Accept" },
    });
  }
  if (result.kind === "not-found") {
    return new Response("# Not found\n\nThere is no page at this address.\n", {
      status: 404,
      headers: MARKDOWN_HEADERS,
    });
  }
  return new Response(result.markdown, {
    headers: {
      ...MARKDOWN_HEADERS,
      Link: `<${result.canonicalUrl}>; rel="canonical"`,
    },
  });
}
