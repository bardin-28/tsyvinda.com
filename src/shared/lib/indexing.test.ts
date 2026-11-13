import { getSiteSettings } from "@/api/siteSettings";
import {
  INDEXING_CACHE_MS,
  isIndexingEnabled,
  resetIndexingCache,
} from "./indexing";

jest.mock("@/api/siteSettings", () => ({ getSiteSettings: jest.fn() }));

const mockGetSiteSettings = getSiteSettings as jest.MockedFunction<
  typeof getSiteSettings
>;

describe("isIndexingEnabled", () => {
  beforeEach(() => {
    resetIndexingCache();
    mockGetSiteSettings.mockReset();
  });

  it("returns the admin setting", async () => {
    mockGetSiteSettings.mockResolvedValue({
      indexingEnabled: false,
      updatedAt: null,
    });
    expect(await isIndexingEnabled(1_000)).toBe(false);
  });

  it("reuses the value for a minute, then asks again", async () => {
    mockGetSiteSettings.mockResolvedValue({
      indexingEnabled: false,
      updatedAt: null,
    });
    await isIndexingEnabled(0);
    await isIndexingEnabled(INDEXING_CACHE_MS - 1);
    expect(mockGetSiteSettings).toHaveBeenCalledTimes(1);

    mockGetSiteSettings.mockResolvedValue({
      indexingEnabled: true,
      updatedAt: null,
    });
    expect(await isIndexingEnabled(INDEXING_CACHE_MS)).toBe(true);
    expect(mockGetSiteSettings).toHaveBeenCalledTimes(2);
  });

  it("defaults to indexing on when the API is unreachable", async () => {
    mockGetSiteSettings.mockRejectedValue(new Error("down"));
    expect(await isIndexingEnabled(0)).toBe(true);
  });

  it("keeps the last known value when a refresh fails", async () => {
    mockGetSiteSettings.mockResolvedValue({
      indexingEnabled: false,
      updatedAt: null,
    });
    await isIndexingEnabled(0);
    mockGetSiteSettings.mockRejectedValue(new Error("down"));
    expect(await isIndexingEnabled(INDEXING_CACHE_MS + 1)).toBe(false);
  });
});
