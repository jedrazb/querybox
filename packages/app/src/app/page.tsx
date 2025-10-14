"use client";

import { useState } from "react";
import SetupFlow from "@/components/SetupFlow";
import Features from "@/components/Features";
import { useQueryBox } from "@/components/QueryBoxProvider";
import styles from "./page.module.css";

export default function Home() {
  const [showSetup, setShowSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<"npm" | "cdn" | "nextjs">("npm");
  const { search, chat } = useQueryBox();

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero} id="home">
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Website Chat & Search
            <br />
            <span className={styles.titleGradient}>
              Powered by Elasticsearch
            </span>
          </h1>
          <p className={styles.subtitle}>
            A lightweight, embeddable JavaScript widget for search and AI chat
            <br />
            powered by Elastic Agent Builder.
          </p>
          <div className={styles.cta}>
            <button className={styles.primaryButton} onClick={() => chat()}>
              Try It!
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => setShowSetup(true)}
            >
              Get Started
            </button>
          </div>
          <div className={styles.installCommand}>
            <code>npm install @jedrazb/querybox</code>
          </div>
          <div className={styles.keyboardHint}>
            <span>
              💡 Tip: Press <kbd>⌘K</kbd> anywhere to search
            </span>
          </div>
        </div>

        {/* Animated Background */}
        <div className={styles.heroBackground}>
          <div className={styles.blob}></div>
          <div className={styles.blob2}></div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <Features />
      </section>

      {/* Setup Flow Modal */}
      {showSetup && <SetupFlow onClose={() => setShowSetup(false)} />}

      {/* Quick Example */}
      <section className={styles.example} id="demo">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Add to Your Website</h2>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "npm" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("npm")}
            >
              npm
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "cdn" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("cdn")}
            >
              CDN
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "nextjs" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("nextjs")}
            >
              Next.js
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "npm" && (
              <div className={styles.codeBlock}>
                <pre>
                  <code>{`npm install @jedrazb/querybox

import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

const querybox = new QueryBox({
  // Get your domain configured at https://querybox.io
  apiEndpoint: '${process.env.NEXT_PUBLIC_API_URL}/api/querybox/yoursite.com/v1'
});

// Open search panel
querybox.search();

// Open AI chat panel
querybox.chat();`}</code>
                </pre>
              </div>
            )}

            {activeTab === "cdn" && (
              <div className={styles.codeBlock}>
                <pre>
                  <code>{`<link rel="stylesheet" href="https://unpkg.com/@jedrazb/querybox/dist/style.css">
<script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>

<script>
  const querybox = new QueryBox({
    // Get your domain configured at https://querybox.io
    apiEndpoint: '${process.env.NEXT_PUBLIC_API_URL}/api/querybox/yoursite.com/v1'
  });

  // Open search panel
  document.getElementById('search-btn').onclick = () => {
    querybox.search();
  };

  // Open AI chat panel
  document.getElementById('chat-btn').onclick = () => {
    querybox.chat();
  };
</script>`}</code>
                </pre>
              </div>
            )}

            {activeTab === "nextjs" && (
              <div className={styles.codeBlock}>
                <pre>
                  <code>{`'use client';
import { useEffect, useRef } from 'react';
import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

export default function Page() {
  const queryboxRef = useRef(null);

  useEffect(() => {
    queryboxRef.current = new QueryBox({
      // Get your domain configured at https://querybox.io
      apiEndpoint: '${process.env.NEXT_PUBLIC_API_URL}/api/querybox/yoursite.com/v1'
    });

    return () => {
      queryboxRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <button onClick={() => queryboxRef.current?.search()}>
        Search
      </button>
      <button onClick={() => queryboxRef.current?.chat()}>
        Ask AI
      </button>
    </div>
  );
}`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Built with ❤️ by{" "}
          <a
            href="https://github.com/jedrazb"
            target="_blank"
            rel="noopener noreferrer"
          >
            jedrazb
          </a>
        </p>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/jedrazb/querybox"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="/docs">Docs</a>
          <a href="/api">API</a>
        </div>
      </footer>
    </main>
  );
}
