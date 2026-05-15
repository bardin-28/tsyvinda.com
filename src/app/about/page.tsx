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
       <p>Trying to hack me or what?</p>
       <h1>Nothing here! <br/> GO AWAY FROM THIS PAGE!</h1>
        <div className={styles.intro}>
            <Link href="/">GO</Link>
        </div>
      </main>
    </div>
  );
}
