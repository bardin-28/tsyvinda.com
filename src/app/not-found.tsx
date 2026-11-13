import Link from "next/link";

import "./[locale]/(home)/globals.css";

/**
 * Only reached for paths outside the language routing (the proxy sends every page path to
 * app/[locale]); app/[locale]/not-found.tsx handles missing pages inside it.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
      >
        <main style={{ textAlign: "center" }}>
          <h1>404 — Page not found</h1>
          <p>
            <Link href="/">Back home</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
