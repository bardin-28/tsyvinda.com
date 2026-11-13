import { SITE_URL } from "../site";
import { SERVER_INFO, SUPPORTED_PROTOCOL_VERSIONS } from "./mcpServer";
import { AGENT_TOOLS, MCP_ENDPOINT_PATH } from "./toolDefinitions";

const ENDPOINT_URL = `${SITE_URL}${MCP_ENDPOINT_PATH}`;
const DESCRIPTION =
  "Read-only tools for tsyvinda.com: Vladyslav Tsyvinda's profile, experience, blog posts and contact details.";

/**
 * MCP Server Card (SEP-1649 / PR #2127 draft — the format is still moving): static description
 * of the `/mcp` endpoint so clients can discover it without connecting first. Readers disagree
 * on the shape, so the essentials appear both flat (`name`, `version`, `endpoint`) and in the
 * nested drafts' `serverInfo` / `transport` / `remotes` forms.
 */
export function buildServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    name: SERVER_INFO.name,
    title: SERVER_INFO.title,
    version: SERVER_INFO.version,
    description: DESCRIPTION,
    endpoint: ENDPOINT_URL,
    url: ENDPOINT_URL,
    protocolVersion: SUPPORTED_PROTOCOL_VERSIONS[0],
    serverInfo: {
      ...SERVER_INFO,
      description: DESCRIPTION,
      homepage: SITE_URL,
      documentation: `${SITE_URL}/llms.txt`,
    },
    transport: {
      type: "streamable-http",
      url: ENDPOINT_URL,
      endpoint: ENDPOINT_URL,
    },
    remotes: [{ type: "streamable-http", url: ENDPOINT_URL }],
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
