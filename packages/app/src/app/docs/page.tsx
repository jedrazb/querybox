"use client";

import { useState } from "react";
import { useQueryBox } from "@/components/QueryBoxProvider";
import InstallationTabs from "@/components/InstallationTabs";
import ApiIntegration from "@/components/ApiIntegration";
import styles from "./docs.module.css";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "installation", title: "Installation" },
  { id: "quick-start", title: "Quick Start" },
  { id: "configuration", title: "Configuration" },
  { id: "api", title: "Widget Interface" },
  { id: "public-api", title: "Public API" },
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
              <a href="#api">Widget Interface</a> - JavaScript methods for
              controlling QueryBox widget
            </li>
            <li>
              <a href="#public-api">Public API</a> - Direct API access for
              search and chat endpoints
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
            powered by{" "}
            <a
              href="https://www.elastic.co/docs/solutions/search/elastic-agent-builder"
              target="_blank"
            >
              Elastic Agent Builder
            </a>
            .
          </p>
          <p className={styles.lead}>
            <a href="/examples">See live examples</a> of QueryBox in action
            across different websites.
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
          <h2>Widget Interface</h2>

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

        <section id="public-api" className={styles.section}>
          <h2>Public API</h2>

          <p>
            QueryBox provides public REST API endpoints for direct integration
            without the widget. Perfect for custom implementations, mobile apps,
            or backend services.
          </p>

          <div className={styles.apiEndpoint}>
            <label>API Base URL</label>
            <code>{process.env.NEXT_PUBLIC_API_URL}</code>
          </div>

          <h3>Available Endpoints</h3>

          <div className={styles.apiMethod}>
            <h4>
              <code>{`POST /{your-domain}/v1/search`}</code>
            </h4>
            <p>
              Search your indexed content. Returns matching results with titles,
              URLs, and relevance scores.
            </p>
          </div>

          <div className={styles.apiMethod}>
            <h4>
              <code>{`POST /{your-domain}/v1/chat`}</code>
            </h4>
            <p>
              AI-powered chat with Server-Sent Events (SSE) streaming. Maintains
              conversation context for multi-turn conversations.
            </p>
          </div>

          <ApiIntegration />
        </section>

        <section id="crawler" className={styles.section}>
          <h2>Crawler</h2>

          <p>
            You can trigger crawls manually from the{" "}
            <a href="/get-started" className={styles.link}>
              Get Started
            </a>{" "}
            page. Re-crawling updates your search index with new or changed
            content.
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://github.com/elastic/crawler"
              target="_blank"
              rel="noopener noreferrer"
            >
              Elastic Open Web Crawler
            </a>
            .
          </p>

          <h3>Embeddings</h3>

          <p>
            QueryBox uses{" "}
            <a href="https://www.elastic.co/docs/explore-analyze/machine-learning/nlp/ml-nlp-elser">
              ELSER
            </a>{" "}
            to generate sparse embeddings for your content. It works best with
            English content.
          </p>

          <h3>Crawler Configuration</h3>

          <p>
            <strong>Crawling only a subset of your site</strong> (e.g.,{" "}
            <code>your-domain.com/docs/*</code>):
          </p>

          <ol className={styles.docList}>
            <li>
              Set up an HTTP redirect from <code>docs.your-domain.com</code> to{" "}
              <code>your-domain.com/docs</code>
            </li>
            <li>
              Add <code>docs.your-domain.com</code> as your crawler domain
            </li>
            <li>
              The crawler will automatically detect the redirect and create a
              configuration scoped to <code>/docs/*</code> only
            </li>
          </ol>

          <p>
            This allows you to create multiple instances of QueryBox for
            different sections of your site (e.g., <code>docs</code>,{" "}
            <code>help</code>, <code>blog</code>), each with its own search
            index and AI chat.
          </p>

          <h3>Common Issues</h3>

          <p>
            <strong>robots.txt blocking crawlers:</strong> Ensure your{" "}
            <code>robots.txt</code> doesn't disallow crawlers. Whitelist the
            QueryBox crawler by allowing <code>QueryBox-Crawler/1.0</code> user
            agent.
          </p>

          <p>
            <strong>HTTPS required:</strong> Your website must be served over
            HTTPS. The crawler only supports secure connections.
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
