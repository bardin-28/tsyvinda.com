"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { Markup, type Block, type BlockData } from "@/shared/cms";
import { AVATAR } from "@/shared/lib/site";

import { CtaBanner } from "../shared/CtaBanner/CtaBanner";
import { RichTextSection } from "../shared/RichTextSection/RichTextSection";
import styles from "./AboutView.module.css";

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

type SectionHeadData = { tag: string; title: string; lede: string };

/** Section revealed on scroll, opened by its eyebrow number, title and lede. */
function RevealSection({
  head,
  anchor,
  children,
}: {
  head: SectionHeadData;
  anchor: string | null;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={anchor ?? undefined}
      className={styles.section}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={containerVariants}
    >
      <motion.div className={styles.sectionHead} variants={itemVariants}>
        {head.tag && <span className={styles.sectionTag}>{head.tag}</span>}
        <h2 className={styles.sectionTitle}>{head.title}</h2>
        {head.lede && <p className={styles.sectionLede}>{head.lede}</p>}
      </motion.div>
      {children}
    </motion.section>
  );
}

function AboutHero({ data }: { data: BlockData<"aboutHero"> }) {
  const headlineWords = [data.headlineFirst, data.headlineSecond].filter(
    Boolean,
  );
  return (
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

        {data.lead && (
          <motion.p className={styles.lead} variants={itemVariants}>
            <Markup text={data.lead} accentClassName={styles.leadAccent} />
          </motion.p>
        )}

        {data.industries && (
          <motion.div
            className={styles.industries}
            variants={containerVariants}
          >
            {data.industries.items.map((industry) => (
              <motion.span
                key={industry}
                className={styles.industry}
                variants={itemVariants}
              >
                {industry}
              </motion.span>
            ))}
          </motion.div>
        )}
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
            src={data.avatar || AVATAR.url}
            alt={data.avatarAlt}
            width={AVATAR.width}
            height={AVATAR.height}
            priority
            className={styles.avatarImg}
          />
        </div>
      </motion.div>
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className={styles.chips}>
      {items.map((item) => (
        <span key={item} className={styles.chip}>
          {item}
        </span>
      ))}
    </div>
  );
}

function AboutStack({
  data,
  anchor,
}: {
  data: BlockData<"aboutStack">;
  anchor: string | null;
}) {
  return (
    <RevealSection head={data} anchor={anchor}>
      <motion.div className={styles.stackGrid} variants={containerVariants}>
        {data.groups.map((group) => (
          <motion.div
            key={group.name}
            className={styles.stackCard}
            variants={itemVariants}
          >
            <h3 className={styles.stackGroup}>{group.name}</h3>
            <Chips items={group.items} />
          </motion.div>
        ))}
      </motion.div>
    </RevealSection>
  );
}

function AboutExperience({
  data,
  anchor,
}: {
  data: BlockData<"aboutExperience">;
  anchor: string | null;
}) {
  return (
    <RevealSection head={data} anchor={anchor}>
      <div className={styles.timeline}>
        <div className={styles.timelineLine} aria-hidden="true" />
        {(data.experience?.roles ?? []).map((role) => (
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
    </RevealSection>
  );
}

function AboutRecommendations({
  data,
  anchor,
}: {
  data: BlockData<"aboutRecommendations">;
  anchor: string | null;
}) {
  return (
    <RevealSection head={data} anchor={anchor}>
      <motion.div className={styles.recGrid} variants={containerVariants}>
        {(data.recommendations?.items ?? []).map((rec) => (
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
              {rec.relation && (
                <span className={styles.recRelation}>{rec.relation}</span>
              )}
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </RevealSection>
  );
}

function AboutEducation({
  data,
  anchor,
}: {
  data: BlockData<"aboutEducation">;
  anchor: string | null;
}) {
  return (
    <RevealSection head={data} anchor={anchor}>
      <motion.div className={styles.eduGrid} variants={containerVariants}>
        {data.items.map((edu) => (
          <motion.article
            key={edu.school}
            className={styles.eduCard}
            variants={itemVariants}
          >
            {edu.period && <div className={styles.eduPeriod}>{edu.period}</div>}
            <h3 className={styles.eduSchool}>{edu.school}</h3>
            {edu.degree && <p className={styles.eduDegree}>{edu.degree}</p>}
            {edu.skills.length > 0 && <Chips items={edu.skills} />}
          </motion.article>
        ))}
      </motion.div>
    </RevealSection>
  );
}

function AboutBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "aboutHero":
      return <AboutHero data={block.data} />;
    case "aboutStack":
      return <AboutStack data={block.data} anchor={block.anchor} />;
    case "aboutExperience":
      return <AboutExperience data={block.data} anchor={block.anchor} />;
    case "aboutRecommendations":
      return <AboutRecommendations data={block.data} anchor={block.anchor} />;
    case "aboutEducation":
      return <AboutEducation data={block.data} anchor={block.anchor} />;
    case "ctaBanner":
      return <CtaBanner data={block.data} anchor={block.anchor} />;
    case "richText":
      return <RichTextSection data={block.data} anchor={block.anchor} />;
    default:
      return null;
  }
}

export type AboutViewProps = { blocks: Block[] };

/** About page: hero, stack, experience, recommendations, education… in the editor's order. */
export function AboutView({ blocks }: AboutViewProps) {
  const reduceMotion = useReducedMotion();
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
        {blocks.map((block) => (
          <AboutBlock key={block.id} block={block} />
        ))}
      </main>
    </div>
  );
}
