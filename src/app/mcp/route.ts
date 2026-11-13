import {
  errorResponse,
  handleMcpMessage,
  JSON_RPC_ERRORS,
} from "@/shared/lib/agent/mcpServer";

/**
 * MCP endpoint (Streamable HTTP transport, stateless): POST one JSON-RPC message, get a JSON
 * answer. Read-only public data, so any origin may call it (browser agents included).
 * Discovery: /.well-known/mcp/server-card.json.
 */

/** Largest request body accepted; real MCP messages here are a few hundred bytes. */
const MAX_BODY_BYTES = 16_384;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json(
      errorResponse(null, JSON_RPC_ERRORS.invalidRequest, "Request too large"),
      413,
    );
  }

  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch {
    return json(errorResponse(null, JSON_RPC_ERRORS.parseError, "Parse error"), 400);
  }
  if (Array.isArray(message)) {
    return json(
      errorResponse(null, JSON_RPC_ERRORS.invalidRequest, "Batch requests are not supported"),
      400,
    );
  }

  const response = await handleMcpMessage(message);
  if (response === null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }
  return json(response);
}

/** No server-to-client stream: this server never sends requests or notifications. */
export function GET(): Response {
  return new Response("Method Not Allowed\n", {
    status: 405,
    headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS" },
  });
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
