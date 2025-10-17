"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        <div className={styles.navWrapper}>
          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
            <Link
              href="/docs"
              className={styles.link}
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/examples"
              className={styles.link}
              onClick={() => setIsMenuOpen(false)}
            >
              Examples
            </Link>
            <a
              href="https://github.com/jedrazb/querybox"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              GitHub
            </a>
          </nav>

          <Link href="/get-started" className={styles.linkHighlight}>
            Get Started
          </Link>

          <button
            className={`${styles.hamburger} ${
              isMenuOpen ? styles.hamburgerOpen : ""
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
