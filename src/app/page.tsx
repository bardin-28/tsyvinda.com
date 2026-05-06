import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
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
          <h1>Home FE | Pipeline up!</h1>
          <nav className={styles.nav}>
            <Link href="/">home</Link>
            <Link href="/about">about</Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
