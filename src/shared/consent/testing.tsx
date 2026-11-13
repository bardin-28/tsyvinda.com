import type { ReactElement } from "react";

import { renderWithIntl } from "@/shared/testing/intl";

import { ConsentProvider } from "./ConsentProvider";
import { CONSENT_COOKIE_NAME } from "./consentStorage";

/** Renders `ui` inside the translations + consent providers (tests only). */
export function renderWithConsent(ui: ReactElement) {
  return renderWithIntl(<ConsentProvider>{ui}</ConsentProvider>);
}

export function clearConsentCookie(): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

/**
 * antd modals ask for `::before`/`::after` styles, which jsdom does not implement (it logs an
 * error per call). Answers those calls with the element's own styles for the test file's run.
 */
export function ignorePseudoElementStyles(): void {
  const originalGetComputedStyle = window.getComputedStyle;
  beforeAll(() => {
    window.getComputedStyle = (element: Element) =>
      originalGetComputedStyle(element);
  });
  afterAll(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });
}
