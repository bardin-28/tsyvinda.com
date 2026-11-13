/**
 * @jest-environment node
 */
import { buildServerCard } from "./serverCard";

jest.mock("./agentTools", () => ({
  ToolInputError: class extends Error {},
  isKnownTool: () => false,
  runAgentTool: jest.fn(),
}));

describe("buildServerCard", () => {
  const card = buildServerCard();

  it("names the server, its version and the endpoint at the top level", () => {
    expect(card).toMatchObject({
      name: "tsyvinda-com",
      version: "1.0.0",
      endpoint: "https://tsyvinda.com/mcp",
    });
  });

  it("repeats the endpoint in the nested draft forms", () => {
    expect(card.transport).toMatchObject({
      type: "streamable-http",
      url: "https://tsyvinda.com/mcp",
    });
    expect(card.remotes).toEqual([
      { type: "streamable-http", url: "https://tsyvinda.com/mcp" },
    ]);
    expect(card.capabilities).toEqual({ tools: { listChanged: false } });
  });
});
