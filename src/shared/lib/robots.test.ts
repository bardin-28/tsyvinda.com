import { buildRobotsTxt, CONTENT_SIGNAL } from "./robots";

describe("buildRobotsTxt", () => {
  const robots = buildRobotsTxt();

  it("declares content signals inside the catch-all group", () => {
    const lines = robots.split("\n");
    const groupStart = lines.indexOf("User-Agent: *");
    expect(groupStart).toBeGreaterThanOrEqual(0);
    expect(lines[groupStart + 1]).toBe(`Content-Signal: ${CONTENT_SIGNAL}`);
    expect(CONTENT_SIGNAL).toContain("ai-train=no");
  });

  it("keeps the site crawlable except the API proxy", () => {
    expect(robots).toContain("Allow: /\n");
    expect(robots).toContain("Disallow: /api/\n");
  });

  it("points crawlers to the sitemap", () => {
    expect(robots).toContain("Sitemap: https://tsyvinda.com/sitemap.xml");
  });
});
