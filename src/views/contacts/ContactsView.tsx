"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Markup, type Block, type BlockData } from "@/shared/cms";
import { SOCIAL_NAV } from "@/shared/const";

import { CtaBanner } from "../shared/CtaBanner/CtaBanner";
import { RichTextSection } from "../shared/RichTextSection/RichTextSection";
import styles from "./ContactsView.module.css";

const LocationMap = dynamic(
  () => import("./components/LocationMap/LocationMap"),
  {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder} aria-hidden="true" />,
  },
);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

function ContactsHero({ data }: { data: BlockData<"contactsHero"> }) {
  return (
    <motion.section
      className={styles.hero}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h1 className={styles.title}>
        <Markup text={data.title} accentClassName={styles.titleAccent} />
      </h1>
      {data.lead && (
        <p className={styles.lead}>
          <Markup text={data.lead} accentClassName={styles.titleAccent} />
        </p>
      )}
      <LocationMap label={data.mapLabel} />
    </motion.section>
  );
}

const ARROW = (
  <svg
    width="16"
    height="16"
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
);

/** Contact channels from the site configuration (SOCIAL_NAV), labels from `common.social`. */
function ContactChannels() {
  const tCommon = useTranslations("common");
  return (
    <motion.ul
      className={styles.channels}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {SOCIAL_NAV.map((item) => {
        const isExternal = item.href.startsWith("http");
        const label = tCommon(`social.${item.labelKey}`);
        return (
          <motion.li key={item.href} variants={itemVariants}>
            <a
              href={item.href}
              className={styles.channel}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={`${label}: ${item.handle}`}
            >
              <span className={styles.channelIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.channelText}>
                <span className={styles.channelLabel}>{label}</span>
                <span className={styles.channelHandle}>{item.handle}</span>
              </span>
              <span className={styles.channelArrow} aria-hidden="true">
                {ARROW}
              </span>
            </a>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function ContactsBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "contactsHero":
      return <ContactsHero data={block.data} />;
    case "contactChannels":
      return <ContactChannels />;
    case "ctaBanner":
      return <CtaBanner data={block.data} anchor={block.anchor} />;
    case "richText":
      return <RichTextSection data={block.data} anchor={block.anchor} />;
    default:
      return null;
  }
}

export type ContactsViewProps = { blocks: Block[] };

/** Contacts page: hero with the Kyiv map and the contact channels, in the editor's order. */
export function ContactsView({ blocks }: ContactsViewProps) {
  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>
      <div className={styles.noise} aria-hidden="true" />
      <main className={styles.main}>
        {blocks.map((block) => (
          <ContactsBlock key={block.id} block={block} />
        ))}
      </main>
    </div>
  );
}
