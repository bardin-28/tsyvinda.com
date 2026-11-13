"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const BlogScene = dynamic(
  () => import("@/app/[locale]/blog/components/BlogScene/BlogScene"),
  { ssr: false },
);

export function BlogBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/blog/cover")) return null;
  return <BlogScene />;
}
