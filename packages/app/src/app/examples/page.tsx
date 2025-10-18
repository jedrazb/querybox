"use client";

import { useTestDemo } from "@/components/TestDemoProvider";
import styles from "./page.module.css";

interface ExampleConfig {
  title: string;
  description: string;
  website: string;
  color: string;
  domain?: string;
  initialQuestions?: string[];
}

const EXAMPLES: ExampleConfig[] = [
  {
    title: "MCP",
    description:
      "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems.",
    website: "https://modelcontextprotocol.io",
    color: "#c6613f",
    domain: "modelcontextprotocol.io",
    initialQuestions: [
      "In 2 sentences, what is the Model Context Protocol?",
      "What is the latest spec version?",
    ],
  },
  {
    title: "A2A",
    description:
      "A2A (Agent-to-Agent Protocol) is an open-source standard for connecting AI agents to external systems.",
    website: "https://a2a-protocol.org",
    color: "#6366f1",
    domain: "a2a-protocol.org",
    initialQuestions: [
      "In 2 sentences, what is the A2A Protocol?",
      "What is the latest spec version?",
    ],
  },
  {
    title: "Elastic",
    description:
      "Elastic is the company behind the Elasticsearch, leading provider of vector database solutions.",
    website: "https://elastic.co",
    color: "#0b64dd",
    domain: "elastic.co",
    initialQuestions: [
      "In 2 sentences, what is an Elastic Serverless project?",
      "Who founded Elastic?",
    ],
  },
  {
    title: "SearchKit",
    description:
      "Searchkit - UI Widgets for Elasticsearch. React, Vue & Javascript supported.",
    website: "https://www.searchkit.co",
    color: "#266769",
    domain: "www.searchkit.co",
    initialQuestions: [
      "In 2 sentences, what is Searchkit?",
      "How Searchkit can be used with Elasticsearch?",
    ],
  },
  {
    title: "Search Labs",
    description:
      "Search news, experiments, and research from the creators of Elasticsearch",
    website: "https://search-labs.elastic.co",
    color: "#36b9ff",
    domain: "search-labs.elastic.co",
    initialQuestions: ["What is Elastic Agent Builder?"],
  },
  {
    title: "Elastic Docs",
    description:
      "Official Elastic documentation. Explore guides for Elastic Cloud (Hosted and Serverless) or on-prem deployments.",
    website: "https://www.elastic.co/docs",
    color: "#5ca168",
    domain: "docs.elastic.co",
    initialQuestions: [
      "What's the easiest way to run ES locally?",
      "What mappings should I use for easy semantic search?",
    ],
  },
];

export default function ExamplesPage() {
  const { initializeForDomain, chat, isModuleLoaded } = useTestDemo();

  const handleTryDemo = async (example: ExampleConfig) => {
    // Extract domain from website URL
    const domain =
      example.domain ||
      example.website.replace(/^https?:\/\//, "").replace(/\/$/, "");

    await initializeForDomain(domain, {
      theme: "auto",
      primaryColor: example.color,
      title: example.title,
      initialQuestions: example.initialQuestions || [],
    });

    // Open chat after a short delay to ensure initialization is complete
    setTimeout(() => {
      chat();
    }, 100);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header Section */}
        <section className={styles.header}>
          <h1 className={styles.title}>
            QueryBox
            <span className={styles.titleGradient}> in Action</span>
          </h1>
          <p className={styles.subtitle}>
            See how QueryBox can be integrated to power search and AI chat
            across different websites.
          </p>
        </section>

        {/* Examples Grid */}
        <section className={styles.examplesSection}>
          {EXAMPLES.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🔍</div>
              <h2 className={styles.emptyStateTitle}>Examples Coming Soon</h2>
              <p className={styles.emptyStateDescription}>
                We're curating live examples of QueryBox integrations.
                <br />
                Check back soon to see QueryBox in action across different
                websites!
              </p>
              <div className={styles.emptyStateCta}>
                <a href="/get-started">
                  <button className={styles.primaryButton}>
                    Create Your Own
                  </button>
                </a>
                <a href="/docs">
                  <button className={styles.secondaryButton}>
                    View Documentation
                  </button>
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {EXAMPLES.map((example, index) => (
                <article key={index} className={styles.card}>
                  {/* Color Indicator */}
                  <div
                    className={styles.colorBar}
                    style={{ backgroundColor: example.color }}
                  />

                  {/* Card Content */}
                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{example.title}</h2>
                    <p className={styles.cardDescription}>
                      {example.description}
                    </p>

                    <div className={styles.cardFooter}>
                      <a
                        href={example.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.websiteLink}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 8H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 1C9.65685 2.89543 10.5 5.37258 10.5 8C10.5 10.6274 9.65685 13.1046 8 15C6.34315 13.1046 5.5 10.6274 5.5 8C5.5 5.37258 6.34315 2.89543 8 1Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {example.website.replace(/^https?:\/\//, "")}
                      </a>

                      <button
                        onClick={() => handleTryDemo(example)}
                        className={styles.demoButton}
                        style={{
                          backgroundColor: example.color,
                        }}
                        disabled={!isModuleLoaded}
                      >
                        {isModuleLoaded ? (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 3.5L11 8L5 12.5V3.5Z"
                                fill="currentColor"
                              />
                            </svg>
                            Try Demo
                          </>
                        ) : (
                          "Loading..."
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        {EXAMPLES.length > 0 && (
          <section className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>
              Ready to add QueryBox to your site?
            </h2>
            <p className={styles.ctaDescription}>
              Get started in minutes with our simple integration guide
            </p>
            <div className={styles.ctaButtons}>
              <a href="/get-started">
                <button className={styles.primaryButton}>Get Started</button>
              </a>
              <a href="/docs">
                <button className={styles.secondaryButton}>
                  Documentation
                </button>
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
