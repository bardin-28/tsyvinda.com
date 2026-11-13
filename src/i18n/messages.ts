import type { Locale } from "./locales";

/**
 * Message files per language: src/messages/<locale>/<namespace>.json. Every namespace must
 * exist with the same keys in every language (checked by messages.test.ts).
 */
export const MESSAGE_NAMESPACES = [
  "common",
  "blog",
  "contacts",
  "cookies",
  "auth",
  "profile",
  "cover",
] as const;
export type MessageNamespace = (typeof MESSAGE_NAMESPACES)[number];

export type Messages = Record<MessageNamespace, Record<string, unknown>>;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    MESSAGE_NAMESPACES.map(async (namespace) => {
      const loaded = (await import(
        `../messages/${locale}/${namespace}.json`
      )) as {
        default: Record<string, unknown>;
      };
      return [namespace, loaded.default] as const;
    }),
  );
  return Object.fromEntries(entries) as Messages;
}
