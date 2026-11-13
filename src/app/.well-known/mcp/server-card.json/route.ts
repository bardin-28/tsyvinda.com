import { buildServerCard } from "@/shared/lib/agent/serverCard";

export const dynamic = "force-static";

/** MCP Server Card at the path proposed by SEP-1649 / PR #2127. */
export function GET(): Response {
  return Response.json(buildServerCard(), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
