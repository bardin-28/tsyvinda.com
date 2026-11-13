import { Fragment, type ReactNode } from "react";

/** Inline tags editors may use in "markup" texts (see the API's TextFieldDefinition.markup). */
const TOKEN = /<(accent|strong)>([\s\S]*?)<\/\1>|<br\s*\/?>(?:<\/br>)?/g;

export type MarkupProps = {
  text: string;
  /** Class of `<accent>…</accent>` spans */
  accentClassName?: string;
};

/**
 * Renders `<accent>…</accent>`, `<strong>…</strong>` and `<br></br>` from CMS text; everything
 * else stays plain text (React escapes it), so editors can't inject markup.
 */
export function Markup({ text, accentClassName }: MarkupProps): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const [, tag, inner] = match;
    if (tag === "accent") {
      parts.push(
        <span key={index} className={accentClassName}>
          {inner}
        </span>,
      );
    } else if (tag === "strong") {
      parts.push(<strong key={index}>{inner}</strong>);
    } else {
      parts.push(<br key={index} />);
    }
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Fragment>{parts}</Fragment>;
}
