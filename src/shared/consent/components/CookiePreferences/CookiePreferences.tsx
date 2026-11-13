"use client";

import { Button, Modal, Switch } from "antd";
import { useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { usePagePath } from "@/shared/cms";

import { useConsent } from "../../ConsentProvider";
import { ALL_ACCEPTED, ALL_REJECTED } from "../../consentStorage";
import {
  CONSENT_CATEGORIES,
  type ConsentCategory,
  type ConsentPreferences,
  type OptionalConsentCategory,
} from "../../types";

import styles from "./CookiePreferences.module.css";

/** Display order in the preference center. */
const CATEGORY_ORDER: readonly ConsentCategory[] = [
  CONSENT_CATEGORIES.NECESSARY,
  CONSENT_CATEGORIES.ANALYTICS,
];

type CategoryRowProps = {
  category: ConsentCategory;
  /** null for the always-on necessary category. */
  isEnabled: boolean | null;
  onToggle: (category: OptionalConsentCategory, isEnabled: boolean) => void;
};

/** One expandable category: `+`/`−` toggle, name, switch (or "Always active"), description. */
function CategoryRow({ category, isEnabled, onToggle }: CategoryRowProps) {
  const t = useTranslations("common.consent");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const panelId = useId();
  const name = t(`categories.${category}.name`);

  return (
    <li className={styles.category}>
      <div className={styles.categoryHeader}>
        <button
          type="button"
          className={styles.categoryToggle}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className={styles.toggleIcon} aria-hidden="true">
            {isExpanded ? "−" : "+"}
          </span>
          {name}
        </button>

        {isEnabled === null ? (
          <span className={styles.alwaysActive}>
            {t("preferences.alwaysActive")}
          </span>
        ) : (
          <Switch
            checked={isEnabled}
            aria-label={name}
            onChange={(checked: boolean) =>
              onToggle(category as OptionalConsentCategory, checked)
            }
          />
        )}
      </div>

      <div id={panelId} className={styles.categoryPanel} hidden={!isExpanded}>
        {t(`categories.${category}.description`)}
      </div>
    </li>
  );
}

type PreferencesContentProps = {
  initialPreferences: ConsentPreferences;
};

/** Modal body + actions. Remounted on every open so the switches start from the saved choice. */
function PreferencesContent({ initialPreferences }: PreferencesContentProps) {
  const cookiePolicyPath = usePagePath("cookie-policy");
  const t = useTranslations("common.consent.preferences");
  const { savePreferences, closePreferences } = useConsent();
  const [draft, setDraft] = useState<ConsentPreferences>(initialPreferences);

  const toggleCategory = (
    category: OptionalConsentCategory,
    isEnabled: boolean,
  ): void => {
    setDraft((current) => ({ ...current, [category]: isEnabled }));
  };

  return (
    <>
      <div className={styles.body}>
        <p className={styles.intro}>
          {t.rich("intro", {
            link: (chunks: ReactNode) => (
              <Link
                href={cookiePolicyPath}
                className={styles.link}
                onClick={closePreferences}
              >
                {chunks}
              </Link>
            ),
          })}
        </p>

        <Button type="primary" onClick={() => savePreferences(ALL_ACCEPTED)}>
          {t("allowAll")}
        </Button>

        <h3 className={styles.manageTitle}>{t("manage")}</h3>
        <ul className={styles.categories}>
          {CATEGORY_ORDER.map((category) => (
            <CategoryRow
              key={category}
              category={category}
              isEnabled={
                category === CONSENT_CATEGORIES.NECESSARY
                  ? null
                  : draft[category]
              }
              onToggle={toggleCategory}
            />
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <Button onClick={() => savePreferences(ALL_REJECTED)}>
          {t("rejectAll")}
        </Button>
        {/* Outlined like Cloudflare's: "Allow all" stays the only filled button in the dialog */}
        <Button
          color="primary"
          variant="outlined"
          className={styles.confirmButton}
          onClick={() => savePreferences(draft)}
        >
          {t("confirm")}
        </Button>
      </div>
    </>
  );
}

/**
 * Preference center ("Your cookie options"), opened from the banner or the footer link.
 * Closing it (×, Esc, mask) saves nothing.
 */
export function CookiePreferences() {
  const t = useTranslations("common.consent.preferences");
  const { isPreferencesOpen, closePreferences, preferences } = useConsent();

  return (
    <Modal
      open={isPreferencesOpen}
      onCancel={closePreferences}
      title={t("title")}
      footer={null}
      width={560}
      centered
      destroyOnHidden
      closable={{ "aria-label": t("close") }}
      className={styles.modal}
    >
      <PreferencesContent initialPreferences={preferences} />
    </Modal>
  );
}
