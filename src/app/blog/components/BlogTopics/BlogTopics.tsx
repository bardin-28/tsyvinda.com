import {
  BLOG_TOPICS,
  BLOG_TOPICS_HEADING,
  BLOG_TOPICS_INTRO,
} from "../../const";
import styles from "./BlogTopics.module.css";

/**
 * Static, server-rendered content for the blog index. Kept out of `BlogView`
 * (a client component) so the copy ships in the HTML without entering the
 * client bundle, and stays visible when the posts feed is empty.
 */
export function BlogTopics() {
  return (
    <section className={styles.section} aria-labelledby="blog-topics-heading">
      <h2 id="blog-topics-heading" className={styles.heading}>
        {BLOG_TOPICS_HEADING}
      </h2>
      <p className={styles.intro}>{BLOG_TOPICS_INTRO}</p>

      <ul className={styles.topics}>
        {BLOG_TOPICS.map((topic) => (
          <li key={topic.title} className={styles.topic}>
            <h3 className={styles.topicTitle}>{topic.title}</h3>
            <p className={styles.topicText}>{topic.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
