import { buildLlmsTxt, type LlmsTxtInput } from "./llms";

const input: LlmsTxtInput = {
  name: "Vladyslav Tsyvinda",
  summary: "Full-Stack Lead\n  Developer.",
  details: "Based in Kyiv.",
  sections: [
    {
      locale: "en",
      pages: [
        {
          title: "About",
          url: "https://tsyvinda.com/about",
          description: "Bio.",
        },
      ],
      posts: [
        {
          title: "Arrays [part 1]",
          url: "https://tsyvinda.com/blog/arrays",
          description: "Lead (2026-08-07)",
        },
      ],
    },
    {
      locale: "uk",
      pages: [{ title: "Про мене", url: "https://tsyvinda.com/uk/about" }],
      posts: [],
    },
  ],
  optional: [{ title: "Sitemap", url: "https://tsyvinda.com/sitemap.xml" }],
};

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt(input);

  it("starts with the H1 name and a one-line blockquote summary", () => {
    expect(
      text.startsWith(
        "# Vladyslav Tsyvinda\n\n> Full-Stack Lead Developer.\n\nBased in Kyiv.",
      ),
    ).toBe(true);
  });

  it("lists default-language pages and posts in their own sections", () => {
    expect(text).toContain(
      "## Pages\n\n- [About](https://tsyvinda.com/about): Bio.",
    );
    expect(text).toContain(
      "## Blog posts\n\n- [Arrays \\[part 1\\]](https://tsyvinda.com/blog/arrays): Lead (2026-08-07)",
    );
  });

  it("groups other languages under one section each", () => {
    expect(text).toContain(
      "## Українська (uk)\n\n- [Про мене](https://tsyvinda.com/uk/about)",
    );
  });

  it("ends with the Optional section and a newline", () => {
    expect(text).toMatch(
      /## Optional\n\n- \[Sitemap\]\(https:\/\/tsyvinda\.com\/sitemap\.xml\)\n$/,
    );
  });

  it("omits the blog section when there are no posts", () => {
    const withoutPosts = buildLlmsTxt({
      ...input,
      sections: [{ ...input.sections[0], posts: [] }],
    });
    expect(withoutPosts).not.toContain("## Blog posts");
  });
});
