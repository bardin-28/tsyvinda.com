import type { BlockData } from "@/shared/cms";

import styles from "./BlogTopics.module.css";

/**
 * What the blog is about (CMS section "Blog — topics"). Keeps meaningful content in the page's
 * HTML even when the posts feed is empty or the posts API is unreachable.
 */
export function BlogTopics({ data }: { data: BlockData<"blogTopics"> }) {
  return (
    <section className={styles.section} aria-labelledby="blog-topics-heading">
      <h2 id="blog-topics-heading" className={styles.heading}>
        {data.heading}
      </h2>
      {data.intro && <p className={styles.intro}>{data.intro}</p>}

      <ul className={styles.topics}>
        {data.topics.map((topic) => (
          <li key={topic.title} className={styles.topic}>
            <h3 className={styles.topicTitle}>{topic.title}</h3>
            {topic.description && (
              <p className={styles.topicText}>{topic.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
