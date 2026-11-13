"use client";

import { useTranslations } from "next-intl";

import { useConsent } from "../../ConsentProvider";

type CookieSettingsButtonProps = {
  className?: string;
  /** Visible text; defaults to "Cookie settings". */
  label?: string;
};

/** Button that reopens the cookie preference center (footer link, Cookie Policy page). */
export function CookieSettingsButton({
  className,
  label,
}: CookieSettingsButtonProps) {
  const t = useTranslations("common.consent");
  const { openPreferences } = useConsent();

  return (
    <button type="button" className={className} onClick={openPreferences}>
      {label ?? t("settingsLink")}
    </button>
  );
}
