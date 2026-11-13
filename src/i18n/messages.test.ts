import { LOCALES } from "./locales";
import { MESSAGE_NAMESPACES } from "./messages";

type Tree = Record<string, unknown>;

/** Dotted paths of every leaf message, e.g. "nav.home". */
function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? keyPaths(value as Tree, path)
      : [path];
  });
}

function load(locale: string, namespace: string): Tree {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`@/messages/${locale}/${namespace}.json`) as Tree;
}

describe("message files", () => {
  it.each(MESSAGE_NAMESPACES)(
    "%s has the same keys in every language",
    (namespace) => {
      const [reference, ...others] = LOCALES;
      const expected = keyPaths(load(reference, namespace)).sort();
      for (const locale of others) {
        expect(keyPaths(load(locale, namespace)).sort()).toEqual(expected);
      }
    },
  );

  it.each(MESSAGE_NAMESPACES)("%s has no empty translations", (namespace) => {
    for (const locale of LOCALES) {
      const tree = load(locale, namespace);
      const empty = keyPaths(tree).filter((path) => {
        const value = path
          .split(".")
          .reduce<unknown>((node, key) => (node as Tree)[key], tree);
        return typeof value === "string" && value.trim() === "";
      });
      expect(empty).toEqual([]);
    }
  });
});
