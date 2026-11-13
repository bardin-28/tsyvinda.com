export type RichTextProps = {
  html: string;
  className?: string;
};

/**
 * Rich text from the CMS. The API sanitizes it on save (allow-listed tags, http(s)/mailto/tel
 * links, `rel="noopener noreferrer"` on external ones) and resolves page links per language, so
 * it is rendered as is.
 */
export function RichText({ html, className }: RichTextProps) {
  if (!html) return null;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
