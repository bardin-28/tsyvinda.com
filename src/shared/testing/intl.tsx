import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import type { Locale } from "@/i18n/locales";
import { MESSAGE_NAMESPACES, type Messages } from "@/i18n/messages";

/** All message namespaces of `locale`, loaded synchronously for tests. */
export function testMessages(locale: Locale = "en"): Messages {
  return Object.fromEntries(
    MESSAGE_NAMESPACES.map((namespace) => [
      namespace,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(`@/messages/${locale}/${namespace}.json`) as Record<
        string,
        unknown
      >,
    ]),
  ) as Messages;
}

export function IntlTestProvider({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={testMessages(locale)}
      timeZone="Europe/Kyiv"
    >
      {children}
    </NextIntlClientProvider>
  );
}

/** Testing Library render inside the translations provider (English unless `locale` is set). */
export function renderWithIntl(
  ui: ReactElement,
  options: RenderOptions & { locale?: Locale } = {},
) {
  const { locale = "en", ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <IntlTestProvider locale={locale}>{children}</IntlTestProvider>
    ),
    ...renderOptions,
  });
}
