/**
 * @jest-environment node
 */
import { normalizeSitePath, ToolInputError } from "./agentTools";

jest.mock("next-intl/server", () => ({ getTranslations: jest.fn() }));
jest.mock("@/shared/cms/api", () => ({}));
jest.mock("../markdown/resolvePageMarkdown", () => ({}));

describe("normalizeSitePath", () => {
  it("accepts paths and site URLs", () => {
    expect(normalizeSitePath("/about")).toBe("/about");
    expect(normalizeSitePath("about")).toBe("/about");
    expect(normalizeSitePath("https://tsyvinda.com/uk/blog/post?x=1#y")).toBe("/uk/blog/post");
    expect(normalizeSitePath("https://www.tsyvinda.com/")).toBe("/");
  });

  it("refuses other sites and empty input", () => {
    expect(() => normalizeSitePath("https://evil.example/about")).toThrow(ToolInputError);
    expect(() => normalizeSitePath("//evil.example/about")).toThrow(ToolInputError);
    expect(() => normalizeSitePath("")).toThrow(ToolInputError);
    expect(() => normalizeSitePath(42)).toThrow(ToolInputError);
  });
});
