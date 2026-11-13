import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

/**
 * The API's cache webhook. After an editor saves a page, an address or a
 * post, the API POSTs `{ tags }` with `Authorization: Bearer <REVALIDATE_SECRET>`; each tag's
 * cached fetches expire now, so the next visit renders the change. Unset secret → 404 (pages
 * still refresh on their own within a minute). Shadows the `/api/*` → API rewrite for this path
 * (array rewrites run after the file system routes).
 */
const bodySchema = z.object({
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9:_-]+$/i),
    )
    .min(1)
    .max(100),
});

function isAuthorized(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? "");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return new NextResponse(null, { status: 404 });
  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const tags = [...new Set(parsed.data.tags)];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
