import { RichText, type BlockData } from "@/shared/cms";

import styles from "./RichTextSection.module.css";

export type RichTextSectionProps = {
  data: BlockData<"richText">;
  anchor?: string | null;
};

/** Free text section (optional heading + editor-written rich text) usable on any page. */
export function RichTextSection({ data, anchor }: RichTextSectionProps) {
  return (
    <section id={anchor ?? undefined} className={styles.section}>
      {data.heading && <h2 className={styles.heading}>{data.heading}</h2>}
      <RichText html={data.html} className={styles.body} />
    </section>
  );
}
