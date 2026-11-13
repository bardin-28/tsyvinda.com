/**
 * Pages render their own <html> in app/[locale]/layout.tsx (the `lang` depends on the language),
 * so the root layout only passes children through.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
