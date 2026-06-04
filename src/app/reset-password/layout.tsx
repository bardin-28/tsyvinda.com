import type { Metadata } from "next";

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
  return children;
}
