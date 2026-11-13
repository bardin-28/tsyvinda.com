import { SITE_URL } from "../site";
import { SERVER_INFO, SUPPORTED_PROTOCOL_VERSIONS } from "./mcpServer";
import { AGENT_TOOLS, MCP_ENDPOINT_PATH } from "./toolDefinitions";

/**
 * MCP Server Card (SEP-1649 / PR #2127 draft — the format is still moving): static description
 * of the `/mcp` endpoint so clients can discover it without connecting first.
 */
export function buildServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: SUPPORTED_PROTOCOL_VERSIONS[0],
    serverInfo: {
      ...SERVER_INFO,
      description:
        "Read-only tools for tsyvinda.com: Vladyslav Tsyvinda's profile, experience, blog posts and contact details.",
      homepage: SITE_URL,
      documentation: `${SITE_URL}/llms.txt`,
    },
    transport: {
      type: "streamable-http",
      url: `${SITE_URL}${MCP_ENDPOINT_PATH}`,
    },
    authentication: { required: false, schemes: [] },
    capabilities: { tools: { listChanged: false } },
    tools: AGENT_TOOLS.map(({ name, title, description }) => ({
      name,
      title,
      description,
    })),
    links: { llmsTxt: `${SITE_URL}/llms.txt`, sitemap: `${SITE_URL}/sitemap.xml` },
  };
}
