import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cover generator",
  description: "Generate branded cover images for blog posts.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/blog/cover" },
};

export default function CoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
