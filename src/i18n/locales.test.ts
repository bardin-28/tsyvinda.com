import { localizePath, splitLocalePath } from "./locales";

describe("localizePath", () => {
  it("keeps English unprefixed and prefixes other languages", () => {
    expect(localizePath("/", "en")).toBe("/");
    expect(localizePath("/blog/hello", "en")).toBe("/blog/hello");
    expect(localizePath("/", "uk")).toBe("/uk");
    expect(localizePath("/blog/hello", "uk")).toBe("/uk/blog/hello");
  });
});

describe("splitLocalePath", () => {
  it("reads the language prefix", () => {
    expect(splitLocalePath("/uk/blog/hello")).toEqual({
      locale: "uk",
      path: "/blog/hello",
    });
    expect(splitLocalePath("/uk")).toEqual({ locale: "uk", path: "/" });
    expect(splitLocalePath("/blog")).toEqual({ locale: "en", path: "/blog" });
    expect(splitLocalePath("/ukraine")).toEqual({
      locale: "en",
      path: "/ukraine",
    });
  });
});
