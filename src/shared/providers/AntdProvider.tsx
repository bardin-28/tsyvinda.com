"use client";

import { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import ukUA from "antd/locale/uk_UA";
import { useLocale } from "next-intl";

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#fd7e14",
    colorInfo: "#fd7e14",
    colorBgContainer: "rgba(255, 255, 255, 0.04)",
    colorBgElevated: "rgba(20, 20, 30, 0.95)",
    colorBorder: "rgba(255, 255, 255, 0.08)",
    colorText: "#ffffff",
    colorTextPlaceholder: "rgba(255, 255, 255, 0.4)",
    colorError: "#ff6b6b",
    borderRadius: 12,
    controlHeight: 40,
    controlHeightLG: 40,
    fontFamily: "var(--font-roboto), sans-serif",
  },
  components: {
    Input: {
      activeBorderColor: "#fd7e14",
      hoverBorderColor: "rgba(253, 126, 20, 0.6)",
      activeShadow: "0 0 0 3px rgba(253, 126, 20, 0.15)",
    },
    Button: {
      primaryShadow: "0 8px 24px rgba(253, 126, 20, 0.35)",
    },
  },
};

export function AntdProvider({ children }: { children: ReactNode }) {
  // antd's own texts (empty states, pickers, …) follow the page language
  const locale = useLocale();
  return (
    <ConfigProvider theme={antdTheme} locale={locale === "uk" ? ukUA : enUS}>
      {children}
    </ConfigProvider>
  );
}
