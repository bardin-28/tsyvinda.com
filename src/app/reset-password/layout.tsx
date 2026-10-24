import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AUTH_UI_ENABLED } from "@/shared/const";
import { NAME } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Reset password",
  description: `Reset your password for ${NAME}.`,
  alternates: { canonical: "/reset-password" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    title: "Reset password",
    description: `Reset your password for ${NAME}.`,
  },
  twitter: {
    title: "Reset password",
    description: `Reset your password for ${NAME}.`,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth UI is disabled for now (see AUTH_UI_ENABLED): the route 404s.
  if (!AUTH_UI_ENABLED) notFound();

  return children;
}
