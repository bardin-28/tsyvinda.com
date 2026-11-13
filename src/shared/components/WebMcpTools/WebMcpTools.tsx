"use client";

import { useEffect } from "react";

import {
  AGENT_TOOLS,
  MCP_ENDPOINT_PATH,
  type AgentToolDefinition,
} from "@/shared/lib/agent/toolDefinitions";

/**
 * WebMCP (https://webmachinelearning.github.io/webmcp/): registers the site's read-only tools with
 * an in-browser AI agent when the browser supports it. Each tool runs on the server through the
 * MCP endpoint, so browser and server agents get identical answers. Renders nothing.
 */

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

type WebMcpTool = AgentToolDefinition & {
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
};

/** The draft moved the API from `navigator.modelContext` to `document.modelContext`. */
type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => unknown;
  unregisterTool?: (name: string) => void;
};

function findModelContext(): ModelContext | null {
  const fromDocument = (document as Document & { modelContext?: ModelContext }).modelContext;
  const fromNavigator = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  return fromDocument ?? fromNavigator ?? null;
}

async function callServerTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  try {
    const response = await fetch(MCP_ENDPOINT_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method: "tools/call",
        params: { name, arguments: args },
      }),
    });
    const body = (await response.json()) as { result?: ToolResult; error?: { message: string } };
    if (body.result) return body.result;
    return { content: [{ type: "text", text: body.error?.message ?? "Tool failed" }], isError: true };
  } catch {
    return { content: [{ type: "text", text: "The site could not be reached." }], isError: true };
  }
}

export function WebMcpTools() {
  useEffect(() => {
    const modelContext = findModelContext();
    if (!modelContext) return;

    const controller = new AbortController();
    for (const definition of AGENT_TOOLS) {
      try {
        // Some builds return a promise that rejects (e.g. name already taken after a remount)
        const registration = modelContext.registerTool(
          { ...definition, execute: (args) => callServerTool(definition.name, args ?? {}) },
          { signal: controller.signal },
        );
        if (registration instanceof Promise) registration.catch(() => undefined);
      } catch {
        // Unsupported tool shape in this browser build: the other tools may still register
      }
    }

    return () => {
      controller.abort();
      for (const definition of AGENT_TOOLS) {
        try {
          modelContext.unregisterTool?.(definition.name);
        } catch {
          // Already removed by the abort signal
        }
      }
    };
  }, []);

  return null;
}
