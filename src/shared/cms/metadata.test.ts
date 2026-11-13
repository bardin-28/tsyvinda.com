import { cmsPageMetadata, localizedPathsAlternates } from "./metadata";
import type { WebsitePage } from "./schemas";

const page: WebsitePage = {
  key: "about",
  locale: "uk",
  locales: ["en", "uk"],
  title: "Про мене",
  seo: {
    title: "Про мене",
    socialTitle: "Про мене — Владислав",
    description: "Опис",
    keywords: ["React"],
    ogImageUrl: null,
    noindex: false,
  },
  blocks: [],
  paths: { en: "/about", uk: "/pro-mene" },
  publishedAt: "2026-11-13T10:00:00.000Z",
};

describe("CMS metadata", () => {
  it("links each language at its own address", () => {
    expect(localizedPathsAlternates(page.paths, "uk")).toEqual({
      canonical: "/uk/pro-mene",
      languages: { en: "/about", uk: "/uk/pro-mene", "x-default": "/about" },
    });
  });

  it("uses the editor's SEO texts and the page address", () => {
    const metadata = cmsPageMetadata(page, {
      siteName: "Site",
      openGraphType: "profile",
    });
    expect(metadata.title).toBe("Про мене");
    expect(metadata.keywords).toEqual(["React"]);
    expect(metadata.openGraph).toMatchObject({
      url: "https://tsyvinda.com/uk/pro-mene",
      title: "Про мене — Владислав",
      locale: "uk_UA",
      alternateLocale: ["en_US"],
    });
    expect(metadata.robots).toMatchObject({ index: true });
  });

  it("hides the page when the editor asked and uses their share image", () => {
    const metadata = cmsPageMetadata(
      {
        ...page,
        seo: { ...page.seo, noindex: true, ogImageUrl: "https://cdn.x/og.png" },
      },
      { siteName: "Site", absoluteTitle: true },
    );
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toEqual({ absolute: "Про мене" });
    expect(metadata.openGraph?.images).toEqual([
      { url: "https://cdn.x/og.png" },
    ]);
  });
});
