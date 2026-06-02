import type { Metadata } from "next";

import { NAME } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Profile",
  description: `Manage the ${NAME} account profile.`,
  alternates: { canonical: "/profile" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: { title: "Profile", description: `Manage the ${NAME} account profile.` },
  twitter: { title: "Profile", description: `Manage the ${NAME} account profile.` },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
