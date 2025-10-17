"use client";

import { useState } from "react";
import { useQueryBox } from "@/components/QueryBoxProvider";
import InstallationTabs from "@/components/InstallationTabs";
import styles from "./docs.module.css";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "installation", title: "Installation" },
  { id: "quick-start", title: "Quick Start" },
  { id: "configuration", title: "Configuration" },
  { id: "api", title: "API Reference" },
  { id: "crawler", title: "Crawler" },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");
  const { search, chat } = useQueryBox();

  return (
    <div className={styles.docsLayout}>
      {/* SEO-friendly content for crawlers */}
      <div className="sr-only">
        <h1>QueryBox Documentation - Complete Guide</h1>
        <p>
          QueryBox is a lightweight, embeddable JavaScript widget that adds
          powerful search and AI-powered chat capabilities to any website. This
          documentation covers installation, configuration, and API reference.
        </p>
        <nav aria-label="Documentation sections">
          <h2>Documentation Contents</h2>
          <ul>
            <li>
              <a href="#overview">Overview</a> - Introduction to QueryBox and
              its features
            </li>
            <li>
              <a href="#installation">Installation</a> - How to install QueryBox
              using NPM, CDN, or React
            </li>
            <li>
              <a href="#quick-start">Quick Start</a> - Get started quickly with
              basic usage examples
            </li>
            <li>
              <a href="#configuration">Configuration</a> - Customize QueryBox
              with themes, colors, and options
            </li>
            <li>
              <a href="#api">API Reference</a> - Complete API documentation for
              QueryBox methods
            </li>
            <li>
              <a href="#crawler">Crawler</a> - Automatic web content crawling
              and indexing
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar with TOC */}
      <aside className={styles.sidebar}>
        <button className={styles.searchButton} onClick={search}>
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchText}>Search docs</span>
          <kbd className={styles.kbd}>⌘ + K</kbd>
        </button>

        <nav className={styles.toc}>
          <h3 className={styles.tocTitle}>Contents</h3>
          <ul className={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={
                    activeSection === section.id ? styles.tocActive : ""
                  }
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        <section id="overview" className={styles.section}>
          <h1>QueryBox Documentation</h1>
          <p className={styles.lead}>
            A lightweight, embeddable JavaScript widget for search and AI chat
            powered by Elastic Agent Builder.
          </p>
        </section>

        <section id="installation" className={styles.section}>
          <h2>Installation</h2>
          <p>Choose your preferred installation method below:</p>
          <InstallationTabs />
        </section>

        <section id="quick-start" className={styles.section}>
          <h2>Quick Start</h2>

          <p>
            The fastest way to get started is using our interactive{" "}
            <a href="/get-started" className={styles.link}>
              Get Started page
            </a>
            . It walks you through the entire setup process including domain
            setup and automatic crawling.
          </p>

          <p>
            QueryBox can{" "}
            <a href="#crawler" className={styles.link}>
              crawl your web content
            </a>{" "}
            automatically to keep your search index up-to-date.
          </p>

          <h3>Manual Setup</h3>
          <p>If you prefer to set up manually, here's a basic example:</p>

          <pre className={styles.code}>
            <code>{`import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

const querybox = new QueryBox({
  apiEndpoint: '${process.env.NEXT_PUBLIC_API_URL}/yoursite.com/v1',
  theme: 'auto',
  primaryColor: '#ec4899'
});

// Open search
querybox.search();

// Open AI chat
querybox.chat();`}</code>
          </pre>
        </section>

        <section id="configuration" className={styles.section}>
          <h2>Configuration</h2>

          <p>
            QueryBox is highly customizable to match your brand and user
            experience. All options except <code>apiEndpoint</code> are optional
            with sensible defaults.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>apiEndpoint</code>
                  </td>
                  <td>string</td>
                  <td>
                    <strong>required</strong>
                  </td>
                  <td>
                    Your QueryBox API endpoint URL (generated during setup)
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>theme</code>
                  </td>
                  <td>'light' | 'dark' | 'auto'</td>
                  <td>'auto'</td>
                  <td>Visual theme. 'auto' follows system preferences</td>
                </tr>
                <tr>
                  <td>
                    <code>primaryColor</code>
                  </td>
                  <td>string</td>
                  <td>'#007aff'</td>
                  <td>
                    Primary color for buttons, links, and accents (hex format)
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>title</code>
                  </td>
                  <td>string</td>
                  <td>undefined</td>
                  <td>
                    Optional title displayed at the top of the panel (e.g.,
                    "Help Center")
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>initialQuestions</code>
                  </td>
                  <td>string[]</td>
                  <td>undefined</td>
                  <td>
                    Array of suggested questions to display in empty chat state
                    (max 3). Users can click these to start a conversation.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>container</code>
                  </td>
                  <td>HTMLElement | string</td>
                  <td>document.body</td>
                  <td>
                    Container element or CSS selector where QueryBox will be
                    mounted
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>classNames</code>
                  </td>
                  <td>object</td>
                  <td>{"{}"}</td>
                  <td>
                    Custom CSS class names for advanced styling (panel,
                    searchPanel, chatPanel, overlay)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Example with All Options</h3>
          <pre className={styles.code}>
            <code>{`const querybox = new QueryBox({
  apiEndpoint: '${process.env.NEXT_PUBLIC_API_URL}/yoursite.com/v1',
  theme: 'dark',
  primaryColor: '#10b981',
  title: 'Documentation',
  initialQuestions: [
    'How do I get started?',
    'What are the pricing options?',
    'How do I integrate with React?'
  ],
  container: '#querybox-container',
  classNames: {
    panel: 'custom-panel',
    overlay: 'custom-overlay'
  }
});`}</code>
          </pre>
        </section>

        <section id="api" className={styles.section}>
          <h2>API Reference</h2>

          <h3>Methods</h3>

          <div className={styles.apiMethod}>
            <h4>
              <code>querybox.search()</code>
            </h4>
            <p>Opens the search panel.</p>
          </div>

          <div className={styles.apiMethod}>
            <h4>
              <code>querybox.chat()</code>
            </h4>
            <p>Opens the AI chat panel.</p>
          </div>

          <div className={styles.apiMethod}>
            <h4>
              <code>querybox.destroy()</code>
            </h4>
            <p>Destroys the instance and cleans up event listeners.</p>
          </div>

          <div className={styles.apiMethod}>
            <h4>
              <code>querybox.isValid()</code>
            </h4>
            <p>
              Returns <code>true</code> if configuration is valid.
            </p>
          </div>

          <div className={styles.apiMethod}>
            <h4>
              <code>querybox.getConfig()</code>
            </h4>
            <p>Returns the current configuration object.</p>
          </div>
        </section>

        <section id="crawler" className={styles.section}>
          <h2>Crawler</h2>

          <p>
            QueryBox can automatically crawl your website content and index it
            into Elasticsearch for search and AI chat.
          </p>
          <p>
            You can trigger a crawl manually from the{" "}
            <a href="/get-started">Get Started</a> page.
          </p>
        </section>

        <footer className={styles.docFooter}>
          <p>
            Need more help?{" "}
            <a
              href="https://github.com/jedrazb/querybox/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open an issue on GitHub
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
