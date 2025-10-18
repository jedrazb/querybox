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
            <span className={styles.freeBadgeText}>✨ Start free</span>
            <span className={styles.freeBadgeDivider}>•</span>
            <span className={styles.freeBadgeText}>Up to 500 pages</span>
          </div>
          <h1 className={styles.title}>
            Add AI Search & Chat
            <br />
            <span className={styles.titleGradient}>to Your Website</span>
          </h1>
          <p className={styles.subtitle}>
            Lightweight search and AI chat widget powered by Elasticsearch.
            <br />
            Crawl your site, add the widget, done.{" "}
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
