import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.icon}>🔍</span>
          <span className={styles.name}>QueryBox</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/#features" className={styles.link}>
            Features
          </Link>
          <Link href="/#demo" className={styles.link}>
            Demo
          </Link>
          <Link href="/docs" className={styles.link}>
            Docs
          </Link>
          <a
            href="https://github.com/jedrazb/querybox"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@jedrazb/querybox"
            className={styles.linkHighlight}
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
        </nav>
      </div>
    </header>
  );
}
