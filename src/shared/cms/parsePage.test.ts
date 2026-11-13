import { blocksOfType, parsePage } from "./parsePage";

const envelope = {
  key: "contacts",
  locale: "en",
  locales: ["en", "uk"],
  title: "Contacts",
  seo: {
    title: "Contacts",
    socialTitle: "Contacts — Site",
    description: "Reach me",
    keywords: [],
    ogImageUrl: null,
    noindex: false,
  },
  paths: { en: "/contacts", uk: "/kontakty" },
  publishedAt: "2026-11-13T10:00:00.000Z",
};

describe("parsePage", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("keeps valid sections in order", () => {
    const page = parsePage({
      ...envelope,
      blocks: [
        { id: "a", type: "contactChannels", anchor: null, data: {} },
        {
          id: "b",
          type: "contactsHero",
          anchor: "top",
          data: { title: "Hi", lead: "", mapLabel: "" },
        },
      ],
    });
    expect(page.blocks.map((block) => block.type)).toEqual([
      "contactChannels",
      "contactsHero",
    ]);
    expect(blocksOfType(page, "contactsHero")[0]?.data.title).toBe("Hi");
  });

  it("drops unknown and drifted sections but renders the rest", () => {
    const page = parsePage({
      ...envelope,
      blocks: [
        { id: "a", type: "newThing", anchor: null, data: {} },
        { id: "b", type: "contactsHero", anchor: null, data: { title: 42 } },
        { id: "c", type: "contactChannels", anchor: null, data: {} },
      ],
    });
    expect(page.blocks.map((block) => block.id)).toEqual(["c"]);
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it("reads the hero photo URL and keeps heroes saved before photos existed", () => {
    const aboutHero = {
      headlineFirst: "Hi",
      headlineSecond: "",
      lead: "",
      avatarAlt: "Me",
      industries: null,
    };
    const page = parsePage({
      ...envelope,
      key: "about",
      blocks: [
        {
          id: "a",
          type: "aboutHero",
          anchor: null,
          data: { ...aboutHero, avatar: "https://cdn.example/pages/me.webp" },
        },
        { id: "b", type: "aboutHero", anchor: null, data: aboutHero },
      ],
    });
    const [uploaded, older] = blocksOfType(page, "aboutHero");
    expect(uploaded?.data.avatar).toBe("https://cdn.example/pages/me.webp");
    expect(older?.data.avatar).toBeUndefined();
  });

  it("throws on a wrong envelope", () => {
    expect(() => parsePage({ ...envelope, key: "nope", blocks: [] })).toThrow();
  });
});
