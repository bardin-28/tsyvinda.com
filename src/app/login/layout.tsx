import type { Metadata } from "next";

import { NAME } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${NAME}.`,
  alternates: { canonical: "/login" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: { title: "Sign in", description: `Sign in to ${NAME}.` },
  twitter: { title: "Sign in", description: `Sign in to ${NAME}.` },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
