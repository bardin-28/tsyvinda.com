/**
 * Tools the site offers AI agents — read-only views of public content. One list for both
 * transports: the MCP endpoint (`/mcp`, server-side agents) and WebMCP (in-browser agents, which
 * call `/mcp` too). Plain data so the browser bundle can import it.
 */

/** JSON Schema of a tool's arguments (the subset these tools use). */
export type ToolInputSchema = {
  type: "object";
  properties: Record<
    string,
    {
      type: "string" | "integer";
      description: string;
      enum?: readonly string[];
      minimum?: number;
      maximum?: number;
    }
  >;
  required?: readonly string[];
  additionalProperties: false;
};

export type AgentToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: ToolInputSchema;
  annotations: { readOnlyHint: true; openWorldHint: false };
};

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

export const LIST_BLOG_POSTS_TOOL: AgentToolDefinition = {
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "Lists published blog posts by Vladyslav Tsyvinda (frontend engineering, React, Next.js, TypeScript, security, delivery), newest first, with URL, summary and date.",
  inputSchema: {
    type: "object",
    properties: {
      locale: {
        type: "string",
        enum: ["en", "uk"],
        description: "Language of the posts: en (English, default) or uk (Ukrainian).",
      },
      category: {
        type: "string",
        description: "Optional category slug to filter by, e.g. \"frontend\".",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        description: "How many posts to return (1–50, default 20).",
      },
    },
    additionalProperties: false,
  },
  annotations: READ_ONLY,
};

export const GET_PAGE_TOOL: AgentToolDefinition = {
  name: "get_page",
  title: "Read a page as Markdown",
  description:
    "Returns any public page of tsyvinda.com as Markdown: home, about (experience, stack, education), contacts, blog, legal pages or a blog post. Pass the path, e.g. \"/about\", \"/uk/about\" or a post URL path.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "Path of the page on tsyvinda.com, starting with \"/\" (a full https://tsyvinda.com URL also works).",
      },
    },
    required: ["path"],
    additionalProperties: false,
  },
  annotations: READ_ONLY,
};

export const GET_CONTACT_DETAILS_TOOL: AgentToolDefinition = {
  name: "get_contact_details",
  title: "Contact details",
  description:
    "Returns how to contact Vladyslav Tsyvinda (email, LinkedIn, Telegram), his role and location.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: READ_ONLY,
};

export const AGENT_TOOLS: readonly AgentToolDefinition[] = [
  LIST_BLOG_POSTS_TOOL,
  GET_PAGE_TOOL,
  GET_CONTACT_DETAILS_TOOL,
];

/** Path of the MCP endpoint (Streamable HTTP, stateless JSON responses). */
export const MCP_ENDPOINT_PATH = "/mcp";
