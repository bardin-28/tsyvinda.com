import { contactsBreadcrumbSchema, contactsMetadata, contactsPageSchema } from "./const/seo";

export const metadata = contactsMetadata;

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactsPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactsBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
