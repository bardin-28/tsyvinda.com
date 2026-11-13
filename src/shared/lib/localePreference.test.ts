import { LOCALE_STORAGE_KEY } from "@/i18n/locales";

import {
  pathInLocale,
  readStoredLocale,
  storeLocale,
} from "./localePreference";

function addAlternate(hreflang: string, href: string): void {
  const link = document.createElement("link");
  link.rel = "alternate";
  link.hreflang = hreflang;
  link.href = href;
  document.head.appendChild(link);
}

beforeEach(() => {
  window.localStorage.clear();
  document.head.innerHTML = "";
});

describe("stored language", () => {
  it("remembers the chosen language and ignores unknown values", () => {
    expect(readStoredLocale()).toBeNull();
    storeLocale("uk");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("uk");
    expect(readStoredLocale()).toBe("uk");
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "de");
    expect(readStoredLocale()).toBeNull();
  });
});

describe("pathInLocale", () => {
  it("follows the page's hreflang link on the current host", () => {
    addAlternate("uk", "https://tsyvinda.com/uk/blog/hello");
    expect(pathInLocale("uk")).toBe("/uk/blog/hello");
  });

  it("falls back to the language's home page without a translation", () => {
    expect(pathInLocale("uk")).toBe("/uk");
    expect(pathInLocale("en")).toBe("/");
  });
});
