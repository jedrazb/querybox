"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import styles from "./page.module.css";
import { useTestDemo } from "@/components/TestDemoProvider";
import InstallationTabs from "@/components/InstallationTabs";
import ApiIntegration from "@/components/ApiIntegration";
import { MAX_CRAWL_URL_COUNT } from "../constants";

type DomainStatus = {
  exists: boolean;
  domain: string;
  indexName?: string;
  agentId?: string;
  toolIds?: string[];
  docCount?: number;
  crawlExecutionId?: string;
  createdAt?: number;
  updatedAt?: number;
};

function GetStartedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chat, initializeForDomain, isReady } = useTestDemo();

  const [domain, setDomain] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [crawlStatus, setCrawlStatus] = useState<
    "pending" | "running" | "completed" | "failed" | "not_started" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [primaryColor, setPrimaryColor] = useState("#ec4899");
  const [title, setTitle] = useState("");
  const [initialQuestions, setinitialQuestions] = useState<string[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showPublicApi, setShowPublicApi] = useState(false);
  const checkingDomainRef = useRef<string | null>(null);

  const cleanDomain = (input: string): string => {
    let cleaned = input.replace(/^https?:\/\//, "");
    cleaned = cleaned.replace(/\/$/, "");
    return cleaned;
  };

  const testQueryBox = () => {
    if (isReady) {
      chat();
    } else {
      console.warn("QueryBox not ready yet");
    }
  };

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const checkCrawlStatus = async () => {
    if (!domain) return;

    try {
      const statusResponse = await fetch(`/api/${domain}/v1/crawl/status`);

      if (!statusResponse.ok) {
        console.error("Failed to check crawl status");
        return;
      }

      const statusData = await statusResponse.json();
      console.log("Crawl status:", statusData);

      // Update crawl status
      setCrawlStatus(statusData.status);

      // Update domain status with new data (including real-time doc count)
      setStatus((prevStatus) => {
        if (!prevStatus) return null;

        const newDocCount = statusData.docCount || prevStatus.docCount || 0;

        return {
          ...prevStatus,
          docCount: newDocCount,
          crawlExecutionId: statusData.executionId,
        };
      });

      // If crawl completed, expand step 2
      if (statusData.status === "completed" && statusData.docCount > 0) {
        setExpandedSteps(new Set([2]));
        setIsCrawling(false);
      } else if (statusData.status === "failed") {
        setError("Crawl failed. Please try again.");
        setIsCrawling(false);
      }
    } catch (err: any) {
      console.error("Error checking crawl status:", err);
    }
  };

  // Load domain from URL on mount
  useEffect(() => {
    const domainParam = searchParams.get("domain");
    if (domainParam && !isLoading) {
      const cleanedDomain = cleanDomain(domainParam);
      console.log("Loading domain from URL:", cleanedDomain);
      setDomain(cleanedDomain);
      // Small delay to ensure state is set
      setTimeout(() => {
        checkDomain(cleanedDomain);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Initialize QueryBox when domain is ready and has docs, or when config changes
  useEffect(() => {
    if (domain && status?.docCount && status.docCount > 0) {
      initializeForDomain(domain, {
        theme,
        primaryColor,
        title,
        initialQuestions,
      });
    }
  }, [domain, status?.docCount, theme, primaryColor, title, initialQuestions]);

  // Poll crawl status when crawl is running
  useEffect(() => {
    if (crawlStatus === "running" && domain) {
      // Start polling
      const interval = setInterval(() => {
        checkCrawlStatus();
      }, 5000); // Check every 5 seconds

      setPollingInterval(interval);

      // Check immediately
      checkCrawlStatus();

      return () => {
        clearInterval(interval);
      };
    } else {
      // Stop polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crawlStatus, domain]);

  const checkDomain = async (domainToCheck?: string) => {
    const targetDomain = domainToCheck || domain;
    if (!targetDomain.trim()) {
      setError("Please enter a domain");
      return;
    }

    const cleanedDomain = cleanDomain(targetDomain);

    // Prevent duplicate calls for the same domain
    if (checkingDomainRef.current === cleanedDomain) {
      console.log("Already checking domain:", cleanedDomain);
      return;
    }

    checkingDomainRef.current = cleanedDomain;
    setDomain(cleanedDomain);

    // Client-side validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(cleanedDomain)) {
      setError(
        "Invalid domain format. Please enter a valid domain (e.g., example.com)"
      );
      setStatus(null);
      setExpandedSteps(new Set([0])); // Keep step 0 expanded
      checkingDomainRef.current = null;
      return;
    }

    if (!cleanedDomain.includes(".")) {
      setError(
        "Please enter a complete domain (e.g., example.com, not just 'example')"
      );
      setStatus(null);
      setExpandedSteps(new Set([0])); // Keep step 0 expanded
      checkingDomainRef.current = null;
      return;
    }

    // Update URL query param
    if (cleanedDomain) {
      router.push(`/get-started?domain=${encodeURIComponent(cleanedDomain)}`);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if domain exists
      const checkResponse = await fetch(`/api/${cleanedDomain}/v1`);

      if (!checkResponse.ok) {
        throw new Error("Failed to check domain status");
      }

      const checkData: DomainStatus = await checkResponse.json();

      console.log("GET response data:", checkData);

      // If domain exists, use the returned data
      if (checkData.exists) {
        console.log("Domain already exists, setting status from GET", {
          indexName: checkData.indexName,
          agentId: checkData.agentId,
          toolIds: checkData.toolIds,
          docCount: checkData.docCount,
          crawlExecutionId: checkData.crawlExecutionId,
        });
        setStatus(checkData);

        // Always check crawl status to detect in-progress crawls
        let currentCrawlStatus = null;
        let updatedDocCount = checkData.docCount || 0;
        try {
          const statusResponse = await fetch(
            `/api/${cleanedDomain}/v1/crawl/status`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            currentCrawlStatus = statusData.status;
            setCrawlStatus(statusData.status);
            updatedDocCount = statusData.docCount || checkData.docCount || 0;

            // Update status with real-time data
            setStatus({
              ...checkData,
              docCount: updatedDocCount,
              crawlExecutionId: statusData.executionId,
            });
          }
        } catch (err) {
          console.error("Error checking crawl status on load:", err);
        }

        // Determine which step to expand:
        // - If crawl is running: keep step 1 expanded
        // - If crawl completed (has docs): expand step 2
        // - Otherwise: expand step 1
        if (currentCrawlStatus === "running") {
          setExpandedSteps(new Set([1]));
          setIsCrawling(true);
        } else if (updatedDocCount > 0) {
          setExpandedSteps(new Set([2]));
        } else {
          setExpandedSteps(new Set([1]));
        }
      } else {
        // Domain doesn't exist - create it via POST (this will validate the domain)
        const setupResponse = await fetch(`/api/${cleanedDomain}/v1`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!setupResponse.ok) {
          const errorData = await setupResponse.json();
          // Check if it's a validation error
          if (errorData.error === "Domain validation failed") {
            throw new Error(errorData.message || "Domain validation failed");
          }
          throw new Error(errorData.message || "Failed to setup domain");
        }

        const setupData = await setupResponse.json();

        console.log("Setup response data:", setupData);

        const newStatus = {
          exists: true,
          domain: setupData.domain,
          indexName: setupData.indexName,
          agentId: setupData.agentId,
          toolIds: setupData.toolIds,
          docCount: setupData.docCount || 0,
        };

        console.log("Setting status to:", newStatus);
        setStatus(newStatus);

        // Show step 1 (crawl) as the next action
        setExpandedSteps(new Set([1]));
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to server");
      setStatus(null);
      setExpandedSteps(new Set([0])); // Keep step 0 expanded on error
    } finally {
      setIsLoading(false);
      checkingDomainRef.current = null;
    }
  };

  const triggerCrawl = async () => {
    if (!domain || !status?.exists) return;

    setIsCrawling(true);
    setError(null);

    try {
      // Start async crawl
      const crawlResponse = await fetch(`/api/${domain}/v1/crawl/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.message || "Failed to start crawl");
      }

      const crawlData = await crawlResponse.json();
      console.log("Crawl started:", crawlData);

      // Update status with execution ID
      setStatus((prevStatus) => {
        if (!prevStatus) return null;
        return {
          ...prevStatus,
          crawlExecutionId: crawlData.executionId,
        };
      });

      // Set crawl status to running
      setCrawlStatus("running");

      // Start polling for status
      checkCrawlStatus();
    } catch (err: any) {
      setError(err.message || "Failed to start crawl");
      setIsCrawling(false);
    }
  };

  const steps = [
    {
      title: "Add your website",
      description: "Create an AI agent",
    },
    {
      title: "Crawl",
      description: "Crawl your website ",
    },
    {
      title: "Test and install",
      description: "Try QueryBox with your data and install it",
    },
  ];

  const isStepCompleted = (index: number) => {
    if (index === 0) {
      // Step 0 is complete only if domain is fully configured
      const isComplete = !!(
        status?.exists &&
        status?.indexName &&
        status?.agentId
      );

      return isComplete;
    }
    if (index === 1) {
      // Step 1 is complete only if content is crawled AND not currently crawling
      return !!(
        status?.docCount &&
        status.docCount > 0 &&
        crawlStatus !== "running"
      );
    }
    return false;
  };

  const getStepNumber = (index: number) => {
    if (isStepCompleted(index)) return "✓";
    return String(index + 1);
  };

  return (
    <main className={styles.container}>
      {/* SEO-friendly content for crawlers */}
      <div className="sr-only">
        <h1>Get Started with QueryBox - Setup Guide</h1>
        <p>
          QueryBox is an embeddable JavaScript widget that adds powerful search
          and AI-powered chat to any website. Follow these three simple steps to
          get started:
        </p>
        <section>
          <h2>Step 1: Add Your Website</h2>
          <p>
            Enter your website domain (e.g., example.com) to create an AI agent
            powered by Elasticsearch. QueryBox will validate your domain and set
            up the necessary infrastructure including an Elasticsearch index and
            AI agent configuration. This step establishes the foundation for
            your search and chat functionality.
          </p>
        </section>
        <section>
          <h2>Step 2: Crawl Your Website</h2>
          <p>
            Start the web crawler to index your website content. The crawler
            will automatically discover and index all accessible pages from your
            domain. Once crawling is complete, your content will be searchable
            and available for AI-powered chat responses. You can re-crawl
            anytime to update the index with new content.
          </p>
        </section>
        <section>
          <h2>Step 3: Test and Install</h2>
          <p>
            Test QueryBox with your indexed content using our live preview. You
            can customize the appearance by choosing a theme (light, dark, or
            auto), setting a primary color, and adding a custom title. Once
            satisfied, copy the installation code snippet and add it to your
            website. Installation methods include NPM package, CDN script tag,
            or React component. The widget provides both search and AI chat
            functionality powered by your website content.
          </p>
        </section>
        <section>
          <h3>Key Features</h3>
          <ul>
            <li>
              Elasticsearch-powered search: Fast, relevant search results from
              your website content
            </li>
            <li>
              AI chat assistant: Intelligent responses based on your website
              content using Elastic Agent Builder
            </li>
            <li>
              Easy installation: Multiple installation methods including NPM,
              CDN, and React
            </li>
            <li>
              Customizable appearance: Match your brand with custom themes and
              colors
            </li>
            <li>
              Automatic crawling: Keep your search index up-to-date with
              periodic re-crawling
            </li>
          </ul>
        </section>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Get Started with QueryBox</h1>
        <p className={styles.subtitle}>
          Set up search and AI chat for your website in 3 simple steps.{" "}
          <a href="/examples" className={styles.examplesLink}>
            See examples of existing integrations →
          </a>
        </p>
      </div>

      <div className={styles.timeline}>
        {/* Timeline Line */}
        <div className={styles.timelineLine} />

        {/* Steps */}
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(index);
          const completed = isStepCompleted(index);

          return (
            <div key={index} className={styles.timelineItem}>
              {/* Timeline Dot */}
              <div
                className={`${styles.timelineDot} ${
                  completed ? styles.completed : ""
                }`}
                onClick={() => toggleStep(index)}
              >
                {getStepNumber(index)}
              </div>

              {/* Step Content */}
              <div className={styles.timelineContent}>
                <div
                  className={styles.stepHeader}
                  onClick={() => toggleStep(index)}
                >
                  <div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    {!!step.description && (
                      <p className={styles.stepDescription}>
                        {step.description}
                      </p>
                    )}
                  </div>
                  <button className={styles.expandButton}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Step 0: Domain Input */}
                {index === 0 && isExpanded && (
                  <div className={styles.stepBody}>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => {
                          setDomain(e.target.value);
                          setError(null); // Clear error when user types
                        }}
                        onKeyPress={(e) => e.key === "Enter" && checkDomain()}
                        className={styles.input}
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => checkDomain()}
                        className={styles.primaryButton}
                        disabled={isLoading || !domain.trim()}
                      >
                        {isLoading ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div className={styles.dotSpinner} />
                            Validating domain...
                          </span>
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                  </div>
                )}

                {/* Step 1: Crawl & Test */}
                {index === 1 && isExpanded && (
                  <div className={styles.stepBody}>
                    {status?.exists ? (
                      <>
                        {/* Always show domain and doc count */}
                        <div className={styles.statusGrid}>
                          <div className={styles.statusItem}>
                            <label>Domain</label>
                            <span>{status.domain}</span>
                          </div>
                          <div className={styles.statusItem}>
                            <label>
                              Pages indexed
                              {crawlStatus === "running" && (
                                <span className={styles.liveIndicator} />
                              )}
                              <Popover.Root>
                                <Popover.Trigger asChild>
                                  <span
                                    className={styles.infoIcon}
                                    role="button"
                                    tabIndex={0}
                                  >
                                    ⓘ
                                  </span>
                                </Popover.Trigger>
                                <Popover.Portal>
                                  <Popover.Content
                                    className={styles.infoTooltip}
                                    sideOffset={55}
                                    side="bottom"
                                    align="start"
                                  >
                                    To ensure fair use, we limit crawling to{" "}
                                    {MAX_CRAWL_URL_COUNT} pages. Need more?{" "}
                                    <a href="mailto:jedrazb@gmail.com">
                                      Reach out
                                    </a>
                                  </Popover.Content>
                                </Popover.Portal>
                              </Popover.Root>
                            </label>
                            <span className={styles.badge}>
                              {status.docCount || 0}
                            </span>
                          </div>
                        </div>

                        {crawlStatus === "failed" && (
                          <div className={styles.error}>
                            Crawl failed. Please try again.
                          </div>
                        )}

                        <div className={styles.recrawlSection}>
                          {!!status.docCount && status.docCount > 0 && (
                            <p className={styles.hint}>
                              Content changed? Crawl again to update the index
                            </p>
                          )}
                          <button
                            onClick={triggerCrawl}
                            className={
                              !!status.docCount && status.docCount > 0
                                ? styles.secondaryButton
                                : styles.primaryButton
                            }
                            disabled={crawlStatus === "running" || isCrawling}
                          >
                            {crawlStatus === "running" || isCrawling ? (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <div className={styles.dotSpinner} />
                                Crawling...
                              </span>
                            ) : !!status.docCount && status.docCount > 0 ? (
                              "Crawl Again"
                            ) : (
                              "Crawl now"
                            )}
                          </button>
                          {crawlStatus === "running" && (
                            <p className={styles.hint}>
                              Crawl usually takes a couple of minutes. You can
                              check your domain status later.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className={styles.hint}>
                        {!domain
                          ? "Enter your domain in step 1 first"
                          : "Complete step 1 to set up your domain first"}
                      </p>
                    )}

                    {error && crawlStatus !== "failed" && (
                      <div className={styles.error}>{error}</div>
                    )}
                  </div>
                )}

                {/* Step 2: Integration */}
                {index === 2 && isExpanded && (
                  <div className={styles.stepBody}>
                    <div className={styles.testSection}>
                      <button
                        onClick={testQueryBox}
                        className={styles.primaryButton}
                        disabled={!isReady}
                      >
                        {isReady ? "Live preview" : "Loading QueryBox..."}
                      </button>
                    </div>
                    <div className={styles.configSection}>
                      <h4 className={styles.configTitle}>Configuration</h4>
                      <div className={styles.configGrid}>
                        <div className={styles.configItem}>
                          <label htmlFor="theme-select">Theme</label>
                          <select
                            id="theme-select"
                            value={theme}
                            onChange={(e) =>
                              setTheme(
                                e.target.value as "light" | "dark" | "auto"
                              )
                            }
                            className={styles.select}
                          >
                            <option value="auto">Auto</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                        <div className={styles.configItem}>
                          <label htmlFor="color-input">Primary Color</label>
                          <div className={styles.colorInputWrapper}>
                            <input
                              id="color-input"
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className={styles.colorInput}
                            />
                            <input
                              type="text"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className={styles.colorTextInput}
                              placeholder="#ec4899"
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.configItem}>
                        <label htmlFor="title-input">Title</label>
                        <input
                          id="title-input"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={styles.input}
                          placeholder="(optional) e.g., Help Center, Support"
                        />
                      </div>
                      <div className={styles.configItem}>
                        <label htmlFor="suggested-question-0">
                          Initial questions
                        </label>
                        <div className={styles.questionsContainer}>
                          {[0, 1, 2].map((index) => {
                            const shouldShow =
                              index === 0 ||
                              (initialQuestions[index - 1] &&
                                initialQuestions[index - 1].trim() !== "");

                            if (!shouldShow) return null;

                            return (
                              <div
                                key={index}
                                className={styles.questionInputWrapper}
                                style={{
                                  animation:
                                    index > 0
                                      ? "slideIn 0.3s ease-out"
                                      : "none",
                                }}
                              >
                                <input
                                  id={`suggested-question-${index}`}
                                  type="text"
                                  value={initialQuestions[index] || ""}
                                  onChange={(e) => {
                                    const newQuestions = [...initialQuestions];
                                    newQuestions[index] = e.target.value;
                                    setinitialQuestions(newQuestions);
                                  }}
                                  className={`${styles.input} ${
                                    initialQuestions[index]
                                      ? styles.inputWithRemove
                                      : ""
                                  }`}
                                  placeholder={
                                    index === 0
                                      ? "(optional) e.g., How do I get started?"
                                      : index === 1
                                      ? "(optional) e.g., What are the pricing options?"
                                      : "(optional) e.g., How do I integrate?"
                                  }
                                />
                                {initialQuestions[index] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions =
                                        initialQuestions.filter(
                                          (_, i) => i !== index
                                        );
                                      setinitialQuestions(newQuestions);
                                    }}
                                    className={styles.removeQuestionBtn}
                                    aria-label="Remove question"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <InstallationTabs
                      apiUrl={process.env.NEXT_PUBLIC_API_URL}
                      domain={domain}
                      theme={theme}
                      primaryColor={primaryColor}
                      title={title}
                      initialQuestions={initialQuestions}
                    />

                    <div className={styles.apiSection}>
                      <div
                        className={styles.apiSectionHeader}
                        onClick={() => setShowPublicApi(!showPublicApi)}
                      >
                        <div>
                          <h4 className={styles.configTitle}>
                            Or use QueryBox API
                            <span className={styles.advancedBadge}>
                              Advanced
                            </span>
                          </h4>
                          <p className={styles.hint}>
                            Integrate search and chat directly into your app
                            without the widget.
                          </p>
                        </div>
                        <button className={styles.expandButton}>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            style={{
                              transform: showPublicApi
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          >
                            <path
                              d="M5 7.5L10 12.5L15 7.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      {showPublicApi && (
                        <div className={styles.apiSectionBody}>
                          <ApiIntegration
                            apiUrl={process.env.NEXT_PUBLIC_API_URL}
                            domain={domain}
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.ctaButtons}>
                      <button
                        onClick={() => (window.location.href = "/")}
                        className={styles.secondaryButton}
                      >
                        Back to Home
                      </button>
                      <button
                        onClick={() => (window.location.href = "/docs")}
                        className={styles.primaryButton}
                      >
                        View Documentation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function GetStarted() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Get Started with QueryBox</h1>
            <p className={styles.subtitle}>Loading...</p>
          </div>
        </div>
      }
    >
      <GetStartedContent />
    </Suspense>
  );
}
