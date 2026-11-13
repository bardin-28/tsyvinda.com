/**
 * @jest-environment node
 */
import { runAgentTool, ToolInputError } from "./agentTools";
import { handleMcpMessage, JSON_RPC_ERRORS, SUPPORTED_PROTOCOL_VERSIONS } from "./mcpServer";

jest.mock("./agentTools", () => {
  class MockToolInputError extends Error {}
  return {
    ToolInputError: MockToolInputError,
    isKnownTool: (name: string) =>
      ["list_blog_posts", "get_page", "get_contact_details"].includes(name),
    runAgentTool: jest.fn(),
  };
});

const mockRunTool = runAgentTool as jest.MockedFunction<typeof runAgentTool>;

const request = (method: string, params?: Record<string, unknown>, id: number | string = 1) => ({
  jsonrpc: "2.0",
  id,
  method,
  ...(params ? { params } : {}),
});

describe("handleMcpMessage", () => {
  beforeEach(() => mockRunTool.mockReset());

  it("answers initialize with the requested protocol version when supported", async () => {
    const response = await handleMcpMessage(
      request("initialize", { protocolVersion: "2025-06-18", capabilities: {} }),
    );
    expect(response).toMatchObject({
      id: 1,
      result: {
        protocolVersion: "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "tsyvinda-com" },
      },
    });
  });

  it("falls back to the newest protocol version", async () => {
    const response = await handleMcpMessage(request("initialize", { protocolVersion: "1999-01-01" }));
    expect(response).toMatchObject({
      result: { protocolVersion: SUPPORTED_PROTOCOL_VERSIONS[0] },
    });
  });

  it("lists the read-only tools", async () => {
    const response = await handleMcpMessage(request("tools/list"));
    const tools = (response as { result: { tools: { name: string }[] } }).result.tools;
    expect(tools.map((tool) => tool.name)).toEqual([
      "list_blog_posts",
      "get_page",
      "get_contact_details",
    ]);
  });

  it("returns tool output as text content", async () => {
    mockRunTool.mockResolvedValue("# About");
    const response = await handleMcpMessage(
      request("tools/call", { name: "get_page", arguments: { path: "/about" } }),
    );
    expect(mockRunTool).toHaveBeenCalledWith("get_page", { path: "/about" });
    expect(response).toMatchObject({
      result: { content: [{ type: "text", text: "# About" }], isError: false },
    });
  });

  it("reports bad arguments as a tool error result", async () => {
    mockRunTool.mockRejectedValue(new ToolInputError('"path" is required'));
    const response = await handleMcpMessage(request("tools/call", { name: "get_page" }));
    expect(response).toMatchObject({
      result: { content: [{ text: '"path" is required' }], isError: true },
    });
  });

  it("hides internal failures behind a generic tool error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockRunTool.mockRejectedValue(new Error("db password leaked"));
    const response = await handleMcpMessage(
      request("tools/call", { name: "list_blog_posts", arguments: {} }),
    );
    expect(JSON.stringify(response)).not.toContain("password");
    expect(response).toMatchObject({ result: { isError: true } });
  });

  it("rejects unknown tools and methods with JSON-RPC errors", async () => {
    expect(await handleMcpMessage(request("tools/call", { name: "rm_rf" }))).toMatchObject({
      error: { code: JSON_RPC_ERRORS.invalidParams },
    });
    expect(await handleMcpMessage(request("resources/list"))).toMatchObject({
      error: { code: JSON_RPC_ERRORS.methodNotFound },
    });
  });

  it("does not answer notifications", async () => {
    expect(
      await handleMcpMessage({ jsonrpc: "2.0", method: "notifications/initialized" }),
    ).toBeNull();
  });

  it("rejects malformed messages", async () => {
    expect(await handleMcpMessage({ hello: "world" })).toMatchObject({
      id: null,
      error: { code: JSON_RPC_ERRORS.invalidRequest },
    });
  });
});
