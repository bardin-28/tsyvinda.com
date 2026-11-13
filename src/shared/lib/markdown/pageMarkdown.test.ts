import type { Post } from "@/api/posts";
import type { WebsitePage } from "@/shared/cms/schemas";

import { cmsPageToMarkdown, postToMarkdown } from "./pageMarkdown";

const page: WebsitePage = {
  key: "about",
  locale: "en",
  locales: ["en", "uk"],
  title: "About",
  seo: {
    title: "About me",
    description: "Lead developer from Kyiv.",
    keywords: [],
    ogImageUrl: null,
    noindex: false,
  },
  paths: { en: "/about", uk: "/pro-mene" },
  publishedAt: "2026-11-01T00:00:00.000Z",
  blocks: [
    {
      id: "1",
      type: "aboutHero",
      anchor: null,
      data: {
        headlineFirst: "Building",
        headlineSecond: "<accent>products</accent>",
        lead: "Six years of <strong>React</strong>.",
        avatar: null,
        avatarAlt: "",
        industries: { items: ["MedTech", "FinTech"] },
      },
    },
    {
      id: "2",
      type: "aboutExperience",
      anchor: null,
      data: {
        tag: "",
        title: "Experience",
        lede: "",
        experience: {
          roles: [
            {
              title: "Lead",
              org: "Acme",
              type: "Full-time",
              period: "2022 — now",
              location: "Remote",
              bullets: ["Shipped things"],
            },
          ],
        },
      },
    },
    {
      id: "3",
      type: "ctaBanner",
      anchor: null,
      data: {
        title: "Let's talk",
        text: "Open to projects.",
        linkLabel: "Contact",
        link: { key: "contacts", path: "/contacts" },
      },
    },
    { id: "4", type: "contactChannels", anchor: null, data: {} },
  ],
};

describe("cmsPageToMarkdown", () => {
  const markdown = cmsPageToMarkdown(page, {
    url: "https://tsyvinda.com/about",
    resolveUrl: (path) => `https://tsyvinda.com${path}`,
    posts: [],
  });

  it("starts with the OG title, description and source URL", () => {
    expect(markdown.startsWith(
      "# About me\n\n> Lead developer from Kyiv.\n\nSource: https://tsyvinda.com/about",
    )).toBe(true);
  });

  it("renders sections in order with editor markup flattened", () => {
    expect(markdown).toContain("## Building products\n\nSix years of **React**.\n\n- MedTech\n- FinTech");
    expect(markdown).toContain("### Lead — Acme\n\n2022 — now · Remote · Full-time\n\n- Shipped things");
    expect(markdown).toContain("[Contact](https://tsyvinda.com/contacts)");
    expect(markdown).toContain("- LinkedIn: https://linkedin.com/in/bardin28");
    expect(markdown.indexOf("## Building")).toBeLessThan(markdown.indexOf("## Experience"));
  });
});

describe("postToMarkdown", () => {
  const post: Post = {
    id: "p1",
    locale: "en",
    locales: ["en"],
    slug: "hello",
    title: "Hello [world]",
    description: "A first post.",
    htmlContent: "<h2>Why</h2><p>Because.</p>",
    imageUrl: "https://cdn.x/cover.webp",
    coverAlt: "Cover",
    author: { id: "a", firstName: "Vlad", lastName: "T", profileImageUrl: null },
    categories: [{ id: "c", name: "Frontend", slug: "frontend" }],
    publishedAt: "2026-10-01T10:00:00.000Z",
    seoTitle: null,
    seoDescription: null,
    ogImageUrl: null,
    canonicalUrl: null,
    createdAt: "2026-09-30T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  };

  it("renders title, lead, byline, cover and body", () => {
    expect(postToMarkdown(post, "https://tsyvinda.com/blog/hello")).toBe(
      [
        "# Hello [world]",
        "> A first post.",
        "By Vlad T · Published 2026-10-01 · Updated 2026-10-02 · Topics: Frontend",
        "Source: https://tsyvinda.com/blog/hello",
        "![Cover](https://cdn.x/cover.webp)",
        "## Why\n\nBecause.",
      ].join("\n\n") + "\n",
    );
  });
});
