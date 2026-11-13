import { useTranslations } from "next-intl";

import { BLOG_TOPIC_KEYS } from "../../const";
import styles from "./BlogTopics.module.css";

/**
 * Static, server-rendered content for the blog index. Kept out of `BlogView`
 * (a client component) so the copy ships in the HTML without entering the
 * client bundle, and stays visible when the posts feed is empty.
 */
export function BlogTopics() {
  const t = useTranslations("blog.topics");
  return (
    <section className={styles.section} aria-labelledby="blog-topics-heading">
      <h2 id="blog-topics-heading" className={styles.heading}>
        {t("heading")}
      </h2>
      <p className={styles.intro}>{t("intro")}</p>

      <ul className={styles.topics}>
        {BLOG_TOPIC_KEYS.map((key) => (
          <li key={key} className={styles.topic}>
            <h3 className={styles.topicTitle}>{t(`${key}.title`)}</h3>
            <p className={styles.topicText}>{t(`${key}.description`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
