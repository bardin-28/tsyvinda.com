"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { AVATAR } from "@/shared/lib/site";
import { ROUTES } from "@/shared/const";
import { SOCIAL_NAV } from "@/shared/const/social";
import styles from "./page.module.css";
import {
  EASE,
  FEATURED_EXPERIENCE,
  FEATURED_RECOMMENDATION,
  INDUSTRIES,
  SECTION_TAGS,
  containerVariants,
  roleVariants,
  sectionContainerVariants,
  sectionItemVariants,
  wordVariants,
} from "./const";

import SmoothScroll from "./components/SmoothScroll/SmoothScroll";

const ScrollOloidScene = dynamic(
  () => import("./components/ScrollOloidScene/ScrollOloidScene"),
  { ssr: false },
);

const ARROW_ICON = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const currentLocale: string = useLocale();
  const locale: Locale = isLocale(currentLocale)
    ? currentLocale
    : DEFAULT_LOCALE;
  const nameWords: string[] = [t("hero.firstName"), t("hero.lastName")];
  const featuredRecommendation = FEATURED_RECOMMENDATION[locale];

  return (
    <SmoothScroll>
      <div className={styles.page} ref={pageRef}>
        {!reduceMotion && <ScrollOloidScene />}

        <div className={styles.blobs} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
        </div>

        <div className={styles.noise} aria-hidden="true" />

        <main className={styles.main}>
          {/* Section 1 — Hero */}
          <section className={styles.hero}>
            <motion.div
              className={styles.avatar}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Image
                src={AVATAR.url}
                alt={t("hero.avatarAlt")}
                width={88}
                height={88}
                priority
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>

            <motion.h1
              className={styles.nameWrap}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {nameWords.map((word) => (
                <motion.span
                  key={word}
                  className={styles.nameWord}
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className={styles.role}
              variants={roleVariants}
              initial="hidden"
              animate="show"
            >
              <span className={styles.roleText}>{t("hero.rolePrimary")}</span>
              <span className={styles.roleDivider} aria-hidden="true">
                ·
              </span>
              <span className={styles.roleSub}>{t("hero.roleSecondary")}</span>
            </motion.p>

            <motion.div
              className={styles.cta}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            >
              <Link
                href={ROUTES.CONTACTS}
                className={styles.ctaButton}
                aria-label={t("hero.contactLabel")}
              >
                <span>{t("hero.contact")}</span>
                {ARROW_ICON}
              </Link>
              <Link href={ROUTES.ABOUT} className={styles.ctaGhost}>
                <span>{t("hero.about")}</span>
              </Link>
            </motion.div>

            <motion.div
              className={styles.scrollCue}
              style={{ opacity: reduceMotion ? 1 : cueOpacity }}
              aria-hidden="true"
            >
              <span className={styles.scrollCueText}>{t("hero.scroll")}</span>
              <span className={styles.scrollCueLine} />
            </motion.div>
          </section>

          {/* Section 2 — About teaser */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div
              className={styles.sectionHead}
              variants={sectionItemVariants}
            >
              <span className={styles.sectionTag}>{SECTION_TAGS.about}</span>
              <h2 className={styles.sectionTitle}>{t("about.title")}</h2>
              <p className={styles.sectionLede}>{t("about.lede")}</p>
            </motion.div>

            <motion.p
              className={styles.teaserLead}
              variants={sectionItemVariants}
            >
              {t("about.lead")}
            </motion.p>

            <motion.div
              className={styles.industries}
              variants={sectionContainerVariants}
            >
              {INDUSTRIES.map((industry) => (
                <motion.span
                  key={industry}
                  className={styles.industry}
                  variants={sectionItemVariants}
                >
                  {industry}
                </motion.span>
              ))}
            </motion.div>
          </motion.section>

          {/* Section 3 — Experience */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div
              className={styles.sectionHead}
              variants={sectionItemVariants}
            >
              <span className={styles.sectionTag}>
                {SECTION_TAGS.experience}
              </span>
              <h2 className={styles.sectionTitle}>{t("experience.title")}</h2>
              <p className={styles.sectionLede}>{t("experience.lede")}</p>
            </motion.div>

            <div className={styles.timeline}>
              <div className={styles.timelineLine} aria-hidden="true" />
              {FEATURED_EXPERIENCE[locale].map((role) => (
                <motion.article
                  key={`${role.org}-${role.title}-${role.period}`}
                  className={styles.timelineItem}
                  variants={sectionItemVariants}
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
                      <div className={styles.roleSubMeta}>
                        <span>{role.period}</span>
                        {role.location && <span>· {role.location}</span>}
                      </div>
                    </header>
                    <p className={styles.roleSummary}>{role.bullets[0]}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div variants={sectionItemVariants}>
              <Link href={ROUTES.ABOUT} className={styles.inlineLink}>
                <span>{t("experience.seeAll")}</span>
                {ARROW_ICON}
              </Link>
            </motion.div>
          </motion.section>

          {/* Section 4 — Recommendation */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div
              className={styles.sectionHead}
              variants={sectionItemVariants}
            >
              <span className={styles.sectionTag}>
                {SECTION_TAGS.recommendation}
              </span>
              <h2 className={styles.sectionTitle}>
                {t("recommendation.title")}
              </h2>
              <p className={styles.sectionLede}>{t("recommendation.lede")}</p>
            </motion.div>

            <motion.figure
              className={styles.recCard}
              variants={sectionItemVariants}
            >
              <blockquote className={styles.recQuote}>
                {featuredRecommendation.quote.map((para) => (
                  <p key={para} className={styles.recPara}>
                    {para}
                  </p>
                ))}
              </blockquote>
              <figcaption className={styles.recFooter}>
                <span className={styles.recName}>
                  {featuredRecommendation.name}
                </span>
                <span className={styles.recRole}>
                  {featuredRecommendation.role}
                </span>
                <span className={styles.recRelation}>
                  {featuredRecommendation.relation}
                </span>
              </figcaption>
            </motion.figure>
          </motion.section>

          {/* Section 5 — Contact */}
          <motion.section
            className={styles.contact}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div
              className={styles.sectionHead}
              variants={sectionItemVariants}
            >
              <span className={styles.sectionTag}>{SECTION_TAGS.contact}</span>
              <h2 className={styles.sectionTitle}>{t("contact.title")}</h2>
              <p className={styles.sectionLede}>{t("contact.lede")}</p>
            </motion.div>

            <motion.div
              className={styles.contactGrid}
              variants={sectionContainerVariants}
            >
              {SOCIAL_NAV.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={styles.contactLink}
                  variants={sectionItemVariants}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={`${tCommon(`social.${item.labelKey}`)} — ${item.handle}`}
                >
                  <span className={styles.contactIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.contactMeta}>
                    <span className={styles.contactLabel}>
                      {tCommon(`social.${item.labelKey}`)}
                    </span>
                    <span className={styles.contactHandle}>{item.handle}</span>
                  </span>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className={styles.contactCta}
              variants={sectionItemVariants}
            >
              <Link
                href={ROUTES.CONTACTS}
                className={styles.ctaButton}
                aria-label={t("hero.contactLabel")}
              >
                <span>{t("hero.contact")}</span>
                {ARROW_ICON}
              </Link>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </SmoothScroll>
  );
}
