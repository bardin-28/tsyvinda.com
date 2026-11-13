import { useTranslations } from "next-intl";

import { COOKIE_ROWS } from "../../const";

import styles from "./CookieTable.module.css";

/** The full cookie list. Scrolls horizontally inside its frame on narrow screens. */
export function CookieTable() {
  const t = useTranslations("cookies.list");

  return (
    <div
      className={styles.frame}
      role="region"
      aria-label={t("title")}
      tabIndex={0}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{t("headers.name")}</th>
            <th scope="col">{t("headers.provider")}</th>
            <th scope="col">{t("headers.purpose")}</th>
            <th scope="col">{t("headers.duration")}</th>
            <th scope="col">{t("headers.category")}</th>
          </tr>
        </thead>
        <tbody>
          {COOKIE_ROWS.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <code className={styles.name}>{row.name}</code>
              </th>
              <td>{row.provider}</td>
              <td>{t(`rows.${row.id}.purpose`)}</td>
              <td className={styles.duration}>
                {t(`rows.${row.id}.duration`)}
              </td>
              <td>
                <span className={`${styles.category} ${styles[row.category]}`}>
                  {t(`categoryNames.${row.category}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
