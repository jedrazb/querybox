import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/querybox.svg"
            alt="QueryBox"
            width={240}
            height={30}
            className={styles.logoImage}
          />
        </Link>

        <nav className={styles.nav}>
          <Link href="/docs" className={styles.link}>
            Docs
          </Link>
          <Link href="/examples" className={styles.link}>
            Examples
          </Link>
          <a
            href="https://github.com/jedrazb/querybox"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link href="/get-started" className={styles.linkHighlight}>
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
