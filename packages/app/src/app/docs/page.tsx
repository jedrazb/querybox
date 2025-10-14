"use client";

import { useState } from "react";
import { useQueryBox } from "@/components/QueryBoxProvider";
import styles from "./docs.module.css";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "installation", title: "Installation" },
  { id: "quick-start", title: "Quick Start" },
  { id: "configuration", title: "Configuration" },
  { id: "usage", title: "Usage" },
  { id: "styling", title: "Styling & Customization" },
  { id: "api", title: "API Reference" },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");
  const { search, chat } = useQueryBox();

  return (
    <div className={styles.docsLayout}>
      {/* Sidebar with TOC */}
      <aside className={styles.sidebar}>
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

        <div className={styles.keyboardShortcut}>
          <div className={styles.shortcutBox}>
            <span className={styles.shortcutIcon}>⌨️</span>
            <div>
              <div className={styles.shortcutTitle}>Quick Search</div>
              <div className={styles.shortcutHint}>
                Press <kbd className={styles.kbd}>⌘K</kbd> to search or ask AI
              </div>
            </div>
          </div>
        </div>
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

          <h3>npm</h3>
          <pre className={styles.code}>
            <code>npm install @jedrazb/querybox</code>
          </pre>

          <h3>pnpm</h3>
          <pre className={styles.code}>
            <code>pnpm add @jedrazb/querybox</code>
          </pre>

          <h3>yarn</h3>
          <pre className={styles.code}>
            <code>yarn add @jedrazb/querybox</code>
          </pre>

          <h3>CDN</h3>
          <pre className={styles.code}>
            <code>{`<link rel="stylesheet" href="https://unpkg.com/@jedrazb/querybox/dist/style.css">
<script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>`}</code>
          </pre>
        </section>

        <section id="quick-start" className={styles.section}>
          <h2>Quick Start</h2>

          <p>Get up and running in under 5 minutes!</p>

          <h3>1. Import and Initialize</h3>
          <pre className={styles.code}>
            <code>{`import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

const querybox = new QueryBox({
  apiEndpoint: 'https://api.querybox.io/api/querybox/yoursite.com/v1'
});`}</code>
          </pre>

          <h3>2. Add to Your Website</h3>
          <pre className={styles.code}>
            <code>{`// Open search
document.getElementById('search-btn').onclick = () => {
  querybox.search();
};

// Open chat
document.getElementById('chat-btn').onclick = () => {
  querybox.chat();
};`}</code>
          </pre>
        </section>

        <section id="configuration" className={styles.section}>
          <h2>Configuration</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Option</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>apiEndpoint</code>
                </td>
                <td>string</td>
                <td>✅</td>
                <td>Your QueryBox API endpoint URL</td>
              </tr>
              <tr>
                <td>
                  <code>container</code>
                </td>
                <td>HTMLElement | string</td>
                <td>❌</td>
                <td>Container element or selector (default: document.body)</td>
              </tr>
              <tr>
                <td>
                  <code>theme</code>
                </td>
                <td>'light' | 'dark' | 'auto'</td>
                <td>❌</td>
                <td>Theme mode (default: 'auto')</td>
              </tr>
              <tr>
                <td>
                  <code>classNames</code>
                </td>
                <td>object</td>
                <td>❌</td>
                <td>Custom CSS class names</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="usage" className={styles.section}>
          <h2>Usage Examples</h2>

          <h3>Vanilla JavaScript</h3>
          <pre className={styles.code}>
            <code>{`<button id="search">Search</button>
<button id="chat">Chat</button>

<script>
  const querybox = new QueryBox({
    apiEndpoint: 'https://api.querybox.io/api/querybox/yoursite.com/v1'
  });

  document.getElementById('search').onclick = () => querybox.search();
  document.getElementById('chat').onclick = () => querybox.chat();
</script>`}</code>
          </pre>

          <h3>React</h3>
          <pre className={styles.code}>
            <code>{`import { useEffect, useRef } from 'react';
import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

function App() {
  const qbRef = useRef(null);

  useEffect(() => {
    qbRef.current = new QueryBox({
      apiEndpoint: 'https://api.querybox.io/...'
    });
  }, []);

  return (
    <>
      <button onClick={() => qbRef.current?.search()}>Search</button>
      <button onClick={() => qbRef.current?.chat()}>Chat</button>
    </>
  );
}`}</code>
          </pre>
        </section>

        <section id="styling" className={styles.section}>
          <h2>Styling & Customization</h2>

          <p>Override CSS variables to customize the appearance:</p>

          <pre className={styles.code}>
            <code>{`:root {
  --querybox-primary: #6366f1;
  --querybox-background: rgba(255, 255, 255, 0.9);
  --querybox-text: #0f172a;
  --querybox-border: rgba(0, 0, 0, 0.1);
  --querybox-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}`}</code>
          </pre>

          <h3>Custom Classes</h3>
          <pre className={styles.code}>
            <code>{`const querybox = new QueryBox({
  apiEndpoint: '...',
  classNames: {
    panel: 'my-custom-panel',
    overlay: 'my-custom-overlay'
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
