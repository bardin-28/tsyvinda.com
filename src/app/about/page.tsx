import { Metadata } from 'next'
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function About() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>About FE</h1>

            <nav className={styles.nav}>
                <Link href="/">home</Link>
                <Link href="/about">about</Link>
            </nav>
        </div>
      </main>
    </div>
  );
}
