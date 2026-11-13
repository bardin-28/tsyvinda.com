import { getPosts, type Post } from "@/api/posts";
import { getRouteMap, getWebsitePage } from "@/shared/cms/api";
import type { WebsitePage } from "@/shared/cms";
import { isIndexingEnabled } from "@/shared/lib/indexing";
import sitemap from "./sitemap";

jest.mock("@/api/posts", () => ({
  ...jest.requireActual("@/api/posts"),
  getPosts: jest.fn(),
}));
jest.mock("@/shared/lib/indexing", () => ({ isIndexingEnabled: jest.fn() }));
jest.mock("@/shared/cms/api", () => ({
  getRouteMap: jest.fn(),
  getWebsitePage: jest.fn(),
}));

const mockGetPosts = getPosts as jest.MockedFunction<typeof getPosts>;
const mockIndexing = isIndexingEnabled as jest.MockedFunction<
  typeof isIndexingEnabled
>;
const mockRouteMap = getRouteMap as jest.MockedFunction<typeof getRouteMap>;
const mockPage = getWebsitePage as jest.MockedFunction<typeof getWebsitePage>;

const post = {
  slug: "hello",
  locales: ["en", "uk"],
  updatedAt: "2026-11-12T21:53:39.173Z",
} as Post;

const PUBLISHED_AT = "2026-11-01T10:00:00.000Z";

function lastModifiedOf(
  entries: Awaited<ReturnType<typeof sitemap>>,
  url: string,
) {
  return entries.find((entry) => entry.url === url)?.lastModified;
}

describe("sitemap", () => {
  beforeEach(() => {
    mockIndexing.mockResolvedValue(true);
    mockGetPosts.mockImplementation(async ({ locale }) => ({
      items: locale === "en" ? [post] : [],
      nextCursor: null,
    }));
    mockRouteMap.mockResolvedValue({
      pages: {
        home: { en: "/", uk: "/" },
        about: { en: "/about", uk: "/pro-mene" },
        blog: { en: "/blog", uk: "/notatky" },
        "privacy-policy": { en: "/privacy-policy" },
      },
    });
    mockPage.mockImplementation(async (key) => {
      if (key === "privacy-policy") {
        return {
          publishedAt: PUBLISHED_AT,
          seo: { noindex: true },
        } as WebsitePage;
      }
      return {
        publishedAt: PUBLISHED_AT,
        seo: { noindex: false },
      } as WebsitePage;
    });
  });

  it("lists each published page at its CMS address with alternates and publish date", async () => {
    const entries = await sitemap();
    const about = entries.find(
      (entry) => entry.url === "https://tsyvinda.com/uk/pro-mene",
    );
    expect(about?.lastModified).toEqual(new Date(PUBLISHED_AT));
    expect(about?.alternates?.languages).toEqual({
      en: "https://tsyvinda.com/about",
      uk: "https://tsyvinda.com/uk/pro-mene",
    });
    expect(lastModifiedOf(entries, "https://tsyvinda.com")).toEqual(
      new Date(PUBLISHED_AT),
    );
  });

  it("leaves out pages hidden from search engines", async () => {
    const entries = await sitemap();
    expect(entries.some((entry) => entry.url.includes("privacy-policy"))).toBe(
      false,
    );
  });

  it("dates the blog by its newest post and puts posts under the blog address", async () => {
    const entries = await sitemap();
    expect(lastModifiedOf(entries, "https://tsyvinda.com/blog")).toEqual(
      new Date(post.updatedAt),
    );
    expect(
      lastModifiedOf(entries, "https://tsyvinda.com/uk/notatky"),
    ).toBeUndefined();
    const postEntry = entries.find(
      (entry) => entry.url === "https://tsyvinda.com/blog/hello",
    );
    expect(postEntry?.alternates?.languages).toMatchObject({
      uk: "https://tsyvinda.com/uk/notatky/hello",
    });
  });

  it("is empty while indexing is off", async () => {
    mockIndexing.mockResolvedValue(false);
    expect(await sitemap()).toEqual([]);
  });
});
