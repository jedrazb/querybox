"use client";

import { useState } from "react";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import FinalCTA from "@/components/FinalCTA";
import { useQueryBox } from "@/components/QueryBoxProvider";
import styles from "./page.module.css";

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const { search, chat } = useQueryBox();

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteUrl.trim()) {
      // Remove protocol and trailing slash
      const cleanDomain = websiteUrl
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      window.location.href = `/get-started?domain=${encodeURIComponent(
        cleanDomain
      )}`;
    }
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero} id="home">
        <div className={styles.heroContent}>
          <div className={styles.freeBadge}>
            <span className={styles.freeBadgeText}>✨ Try for free</span>
            <span className={styles.freeBadgeDivider}>•</span>
            <span className={styles.freeBadgeText}>Up to 500 pages</span>
          </div>
          <h1 className={styles.title}>
            Add AI Search & Chat
            <br />
            <span className={styles.titleGradient}>to Your Website</span>
          </h1>
          <p className={styles.subtitle}>
            Lightweight JavaScript widget powered by Elasticsearch.
            <br />
            Crawl your site, embed the widget, done.{" "}
            <a href="/examples" className={styles.examplesLink}>
              See examples →
            </a>
          </p>
          <div className={styles.cta}>
            <a href="/get-started">
              <button className={styles.primaryButton}>Get Started</button>
            </a>
            <button className={styles.secondaryButton} onClick={() => chat()}>
              Try Demo
            </button>
          </div>
          <div className={styles.installCommand}>
            <code>npm install @jedrazb/querybox</code>
          </div>
          <div className={styles.keyboardHint}>
            <span>
              💡 Tip: Press <kbd>⌘ + K</kbd> anywhere to search
            </span>
          </div>
          <div className={styles.socialProof}>
            <a
              href="https://github.com/jedrazb/querybox"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubBadge}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{ marginRight: "0.5rem" }}
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>

        {/* Animated Background */}
        <div className={styles.heroBackground}>
          <div className={styles.blob}></div>
          <div className={styles.blob2}></div>
        </div>
      </section>

      {/* Add to Website Section */}
      <section className={styles.addWebsite} id="add">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Add to your website</h2>

          <form onSubmit={handleAddWebsite} className={styles.addWebsiteForm}>
            <input
              type="text"
              placeholder="yoursite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={styles.websiteInput}
              required
            />
            <button type="submit" className={styles.addButton}>
              Add
            </button>
          </form>
        </div>
      </section>

      {/* Who is this for? */}
      <section id="use-cases">
        <UseCases />
      </section>

      {/* Features */}
      <section id="features">
        <Features />
      </section>

      {/* Final CTA */}
      <FinalCTA />
    </main>
  );
}
