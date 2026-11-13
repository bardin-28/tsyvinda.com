import { render } from "@testing-library/react";

import { AGENT_TOOLS } from "@/shared/lib/agent/toolDefinitions";

import { WebMcpTools } from "./WebMcpTools";

type RegisteredTool = {
  name: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

describe("WebMcpTools", () => {
  const registerTool = jest.fn();
  const unregisterTool = jest.fn();

  beforeEach(() => {
    registerTool.mockReset();
    unregisterTool.mockReset();
    Object.defineProperty(navigator, "modelContext", {
      value: { registerTool, unregisterTool },
      configurable: true,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "modelContext");
  });

  it("registers every tool and removes them on unmount", () => {
    const { unmount } = render(<WebMcpTools />);
    expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual(
      AGENT_TOOLS.map((tool) => tool.name),
    );
    unmount();
    expect(unregisterTool).toHaveBeenCalledTimes(AGENT_TOOLS.length);
  });

  it("runs a tool through the MCP endpoint", async () => {
    const result = { content: [{ type: "text", text: "# Contacts" }], isError: false };
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ result }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    Object.defineProperty(global, "crypto", {
      value: { randomUUID: () => "id-1" },
      configurable: true,
    });

    render(<WebMcpTools />);
    const tool = registerTool.mock.calls
      .map(([registered]) => registered as RegisteredTool)
      .find((registered) => registered.name === "get_contact_details");

    await expect(tool?.execute({})).resolves.toEqual(result);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/mcp");
    expect(JSON.parse(init.body)).toMatchObject({
      method: "tools/call",
      params: { name: "get_contact_details", arguments: {} },
    });
  });

  it("does nothing in browsers without WebMCP", () => {
    Reflect.deleteProperty(navigator, "modelContext");
    expect(() => render(<WebMcpTools />)).not.toThrow();
    expect(registerTool).not.toHaveBeenCalled();
  });
});
