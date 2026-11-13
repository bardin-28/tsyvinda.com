import { buildRobotsTxt } from "@/shared/lib/robots";

export const dynamic = "force-static";

/** `/robots.txt` — see `buildRobotsTxt` for why this is not a `robots.ts` metadata route. */
export function GET(): Response {
  return new Response(buildRobotsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
