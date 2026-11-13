"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { AVATAR } from "@/shared/lib/site";
import { ROUTES } from "@/shared/const";
import styles from "./page.module.css";
import {
  EDUCATION,
  EXPERIENCE,
  INDUSTRIES,
  RECOMMENDATIONS,
  STACK,
} from "./const";

const AboutScene = dynamic(() => import("./components/AboutScene/AboutScene"), {
  ssr: false,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

export default function About() {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("about");
  const currentLocale: string = useLocale();
  const locale: Locale = isLocale(currentLocale)
    ? currentLocale
    : DEFAULT_LOCALE;
  const headlineWords: string[] = [
    t("hero.headlineFirst"),
    t("hero.headlineSecond"),
  ];

  return (
    <div className={styles.page}>
      {!reduceMotion && <AboutScene />}

      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroLeft}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.h1 className={styles.headline} variants={containerVariants}>
              {headlineWords.map((word) => (
                <motion.span
                  key={word}
                  className={styles.headlineWord}
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p className={styles.lead} variants={itemVariants}>
              {t.rich("hero.lead", {
                accent: (chunks) => (
                  <span className={styles.leadAccent}>{chunks}</span>
                ),
              })}
            </motion.p>

            <motion.div
              className={styles.industries}
              variants={containerVariants}
            >
              {INDUSTRIES.map((industry) => (
                <motion.span
                  key={industry}
                  className={styles.industry}
                  variants={itemVariants}
                >
                  {industry}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <div className={styles.avatarFrame}>
              <div className={styles.avatarGlow} aria-hidden="true" />
              <div className={styles.avatarRing} aria-hidden="true" />
              <Image
                src={AVATAR.url}
                alt={t("hero.avatarAlt")}
                width={AVATAR.width}
                height={AVATAR.height}
                priority
                className={styles.avatarImg}
              />
            </div>
          </motion.div>
        </section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>01</span>
            <h2 className={styles.sectionTitle}>{t("stack.title")}</h2>
            <p className={styles.sectionLede}>{t("stack.lede")}</p>
          </motion.div>

          <motion.div className={styles.stackGrid} variants={containerVariants}>
            {STACK.map((group) => (
              <motion.div
                key={group.groupKey}
                className={styles.stackCard}
                variants={itemVariants}
              >
                <h3 className={styles.stackGroup}>
                  {t(`stack.groups.${group.groupKey}`)}
                </h3>
                <div className={styles.chips}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>02</span>
            <h2 className={styles.sectionTitle}>{t("experience.title")}</h2>
            <p className={styles.sectionLede}>{t("experience.lede")}</p>
          </motion.div>

          <div className={styles.timeline}>
            <div className={styles.timelineLine} aria-hidden="true" />
            {EXPERIENCE[locale].map((role) => (
              <motion.article
                key={`${role.org}-${role.title}-${role.period}`}
                className={styles.timelineItem}
                variants={itemVariants}
              >
                <div className={styles.timelineDot} aria-hidden="true" />
                <div className={styles.timelineCard}>
                  <header className={styles.roleHead}>
                    <h3 className={styles.roleTitle}>{role.title}</h3>
                    <div className={styles.roleMeta}>
                      <span className={styles.roleOrg}>{role.org}</span>
                      {role.type && (
                        <span className={styles.roleType}>· {role.type}</span>
                      )}
                    </div>
                    <div className={styles.roleSub}>
                      <span>{role.period}</span>
                      {role.location && <span>· {role.location}</span>}
                    </div>
                  </header>
                  <ul className={styles.bullets}>
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>03</span>
            <h2 className={styles.sectionTitle}>
              {t("recommendations.title")}
            </h2>
            <p className={styles.sectionLede}>{t("recommendations.lede")}</p>
          </motion.div>

          <motion.div className={styles.recGrid} variants={containerVariants}>
            {RECOMMENDATIONS[locale].map((rec) => (
              <motion.figure
                key={rec.name}
                className={styles.recCard}
                variants={itemVariants}
              >
                <blockquote className={styles.recQuote}>
                  {rec.quote.map((para) => (
                    <p key={para} className={styles.recPara}>
                      {para}
                    </p>
                  ))}
                </blockquote>
                <figcaption className={styles.recFooter}>
                  <span className={styles.recName}>{rec.name}</span>
                  <span className={styles.recRole}>{rec.role}</span>
                  <span className={styles.recRelation}>{rec.relation}</span>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>04</span>
            <h2 className={styles.sectionTitle}>{t("education.title")}</h2>
            <p className={styles.sectionLede}>{t("education.lede")}</p>
          </motion.div>

          <motion.div className={styles.eduGrid} variants={containerVariants}>
            {EDUCATION[locale].map((edu) => (
              <motion.article
                key={edu.school}
                className={styles.eduCard}
                variants={itemVariants}
              >
                <div className={styles.eduPeriod}>{edu.period}</div>
                <h3 className={styles.eduSchool}>{edu.school}</h3>
                <p className={styles.eduDegree}>{edu.degree}</p>
                {edu.skills.length > 0 && (
                  <div className={styles.chips}>
                    {edu.skills.map((skill) => (
                      <span key={skill} className={styles.chip}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.cta}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className={styles.ctaTitle}>{t("cta.title")}</h2>
          <p className={styles.ctaText}>{t("cta.text")}</p>
          <div className={styles.ctaLinks}>
            <Link href={ROUTES.CONTACTS} className={styles.ctaLink}>
              <span>{t("cta.contact")}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
