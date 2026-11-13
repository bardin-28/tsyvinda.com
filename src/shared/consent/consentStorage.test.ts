import {
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  readConsent,
  subscribeToConsent,
  writeConsent,
} from "./consentStorage";

function clearConsentCookie(): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function setRawConsentCookie(value: string): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/`;
}

describe("consent storage", () => {
  afterEach(clearConsentCookie);

  it("returns null when nothing is stored", () => {
    expect(readConsent()).toBeNull();
  });

  it("round-trips a choice with version and time", () => {
    const now = new Date("2026-11-13T10:00:00.000Z");
    const written = writeConsent({ analytics: false }, now);

    expect(written).toEqual({
      version: CONSENT_VERSION,
      analytics: false,
      updatedAt: "2026-11-13T10:00:00.000Z",
    });
    expect(readConsent()).toEqual(written);
  });

  it("ignores a malformed cookie", () => {
    setRawConsentCookie("{not json");
    expect(readConsent()).toBeNull();

    setRawConsentCookie(JSON.stringify({ version: CONSENT_VERSION }));
    expect(readConsent()).toBeNull();
  });

  it("ignores a choice saved under an older version (asks again)", () => {
    setRawConsentCookie(
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        analytics: true,
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    expect(readConsent()).toBeNull();
  });
});

describe("subscribeToConsent", () => {
  afterEach(clearConsentCookie);

  it("notifies on every save until unsubscribed", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToConsent(listener);

    writeConsent({ analytics: true });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    writeConsent({ analytics: true });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
