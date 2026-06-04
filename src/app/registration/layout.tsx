import type { Metadata } from "next";

import { NAME } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Create account",
  description: `Create an account for ${NAME}.`,
  alternates: { canonical: "/registration" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    title: "Create account",
    description: `Create an account for ${NAME}.`,
  },
  twitter: {
    title: "Create account",
    description: `Create an account for ${NAME}.`,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
