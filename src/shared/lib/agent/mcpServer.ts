import { isKnownTool, runAgentTool, ToolInputError, type ToolArguments } from "./agentTools";
import { AGENT_TOOLS } from "./toolDefinitions";

/**
 * Minimal stateless MCP server (JSON-RPC 2.0 over Streamable HTTP, JSON responses only):
 * `initialize`, `ping`, `tools/list`, `tools/call`. No sessions, resources, prompts or
 * server-initiated messages — the tools are read-only lookups of public content.
 */

export const SERVER_INFO = {
  name: "tsyvinda-com",
  title: "Vladyslav Tsyvinda — website",
  version: "1.0.0",
} as const;

/** Newest first; a client asking for another version gets the newest. */
export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"] as const;

const INSTRUCTIONS =
  "Read-only access to tsyvinda.com, the personal site of Vladyslav Tsyvinda (Full-Stack Lead Developer, Kyiv). Use get_page with \"/\" or \"/about\" for profile and experience, list_blog_posts for articles, get_contact_details for contacts.";

export const JSON_RPC_ERRORS = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603,
} as const;

type JsonRpcId = string | number | null;

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId; error: { code: number; message: string } };

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return (
    isRecord(value) &&
    value.jsonrpc === "2.0" &&
    typeof value.method === "string" &&
    (value.params === undefined || isRecord(value.params)) &&
    (value.id === undefined ||
      value.id === null ||
      typeof value.id === "string" ||
      typeof value.id === "number")
  );
}

export function errorResponse(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function success(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function initializeResult(params: Record<string, unknown> | undefined) {
  const requested = params?.protocolVersion;
  const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.find((version) => version === requested)
    ?? SUPPORTED_PROTOCOL_VERSIONS[0];
  return {
    protocolVersion,
    capabilities: { tools: { listChanged: false } },
    serverInfo: SERVER_INFO,
    instructions: INSTRUCTIONS,
  };
}

async function callTool(id: JsonRpcId, params: Record<string, unknown> | undefined) {
  const name = params?.name;
  if (typeof name !== "string" || !isKnownTool(name)) {
    return errorResponse(id, JSON_RPC_ERRORS.invalidParams, `Unknown tool: ${String(name)}`);
  }
  const args: ToolArguments = isRecord(params?.arguments) ? params.arguments : {};
  try {
    const text = await runAgentTool(name, args);
    return success(id, { content: [{ type: "text", text }], isError: false });
  } catch (error) {
    // Tool failures go back as results the agent can read and act on (MCP spec)
    const message =
      error instanceof ToolInputError ? error.message : "The site content is unavailable right now.";
    if (!(error instanceof ToolInputError)) console.error("[mcp] tool failed", name, error);
    return success(id, { content: [{ type: "text", text: message }], isError: true });
  }
}

/**
 * Handles one JSON-RPC message. Returns null for notifications and responses sent by the client
 * (nothing to answer; the HTTP layer replies 202).
 */
export async function handleMcpMessage(message: unknown): Promise<JsonRpcResponse | null> {
  if (!isJsonRpcRequest(message)) {
    // A client's response to a server request (we never send any) or garbage
    if (isRecord(message) && message.jsonrpc === "2.0" && !("method" in message)) return null;
    const id = isRecord(message) && (typeof message.id === "string" || typeof message.id === "number")
      ? message.id
      : null;
    return errorResponse(id, JSON_RPC_ERRORS.invalidRequest, "Invalid JSON-RPC request");
  }
  if (message.id === undefined) return null; // notification, e.g. notifications/initialized

  const { id, method, params } = message;
  switch (method) {
    case "initialize":
      return success(id, initializeResult(params));
    case "ping":
      return success(id, {});
    case "tools/list":
      return success(id, { tools: AGENT_TOOLS });
    case "tools/call":
      return callTool(id, params);
    default:
      return errorResponse(id, JSON_RPC_ERRORS.methodNotFound, `Method not found: ${method}`);
  }
}
