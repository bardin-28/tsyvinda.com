import { BlogBackground } from "./components/BlogBackground/BlogBackground";
import { blogBreadcrumbSchema, blogMetadata, blogSchema } from "./const/seo";

export const metadata = blogMetadata;

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogBreadcrumbSchema) }}
      />
      <BlogBackground />
      {children}
    </>
  );
}
