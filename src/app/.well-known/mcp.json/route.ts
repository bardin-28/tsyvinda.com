import { buildServerCard } from "@/shared/lib/agent/serverCard";

export const dynamic = "force-static";

/** Same MCP Server Card at the earlier SEP-1649 path, for clients that still look here. */
export function GET(): Response {
  return Response.json(buildServerCard(), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
