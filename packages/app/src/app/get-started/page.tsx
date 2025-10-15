"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useTestDemo } from "@/components/TestDemoProvider";
import InstallationTabs from "@/components/InstallationTabs";

type DomainStatus = {
  exists: boolean;
  domain: string;
  indexName?: string;
  agentId?: string;
  toolIds?: string[];
  docCount?: number;
  crawlStatus?: string;
  createdAt?: number;
  updatedAt?: number;
};

function GetStartedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { search, initializeForDomain, isReady } = useTestDemo();

  const [domain, setDomain] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [primaryColor, setPrimaryColor] = useState("#ec4899");
  const [title, setTitle] = useState("");

  const cleanDomain = (input: string): string => {
    let cleaned = input.replace(/^https?:\/\//, "");
    cleaned = cleaned.replace(/\/$/, "");
    cleaned = cleaned.replace(/^www\./, "");
    return cleaned;
  };

  // Load domain from URL on mount
  useEffect(() => {
    const domainParam = searchParams.get("domain");
    if (domainParam) {
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
      initializeForDomain(domain, { theme, primaryColor, title });
    }
  }, [domain, status?.docCount, theme, primaryColor, title]);

  const testQueryBox = () => {
    if (isReady) {
      search();
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

  const checkDomain = async (domainToCheck?: string) => {
    const targetDomain = domainToCheck || domain;
    if (!targetDomain.trim()) {
      setError("Please enter a domain");
      return;
    }

    const cleanedDomain = cleanDomain(targetDomain);
    setDomain(cleanedDomain);

    // Client-side validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(cleanedDomain)) {
      setError(
        "Invalid domain format. Please enter a valid domain (e.g., example.com)"
      );
      setStatus(null);
      setExpandedSteps(new Set([0])); // Keep step 0 expanded
      return;
    }

    if (!cleanedDomain.includes(".")) {
      setError(
        "Please enter a complete domain (e.g., example.com, not just 'example')"
      );
      setStatus(null);
      setExpandedSteps(new Set([0])); // Keep step 0 expanded
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
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/querybox/${cleanedDomain}/v1`
      );

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
        });
        setStatus(checkData);
        // If crawl is completed (has docs), expand step 2, otherwise expand step 1
        setExpandedSteps(
          new Set([checkData.docCount && checkData.docCount > 0 ? 2 : 1])
        );
      } else {
        // Domain doesn't exist - create it via POST (this will validate the domain)
        const setupResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/querybox/${cleanedDomain}/v1`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

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
    }
  };

  const triggerCrawl = async () => {
    if (!domain || !status?.exists) return;

    setIsCrawling(true);
    setError(null);

    try {
      // Start crawl
      const crawlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/querybox/${domain}/v1/crawl`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startUrl: `https://${domain}`,
          }),
        }
      );

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.message || "Failed to start crawl");
      }

      // Refresh status after a delay to show updated doc count
      setTimeout(() => checkDomain(), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to crawl");
    } finally {
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
      // Step 1 is complete only if content is crawled
      return !!(status?.docCount && status.docCount > 0);
    }
    return false;
  };

  const getStepNumber = (index: number) => {
    if (isStepCompleted(index)) return "✓";
    return String(index + 1);
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Get Started with QueryBox</h1>
        <p className={styles.subtitle}>
          Set up search and AI chat for your website in 3 simple steps
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
                    {status?.docCount && status.docCount > 0 ? (
                      <>
                        <div className={styles.statusGrid}>
                          <div className={styles.statusItem}>
                            <label>Domain</label>
                            <span>{status.domain}</span>
                          </div>
                          <div className={styles.statusItem}>
                            <label>Pages indexed</label>
                            <span className={styles.badge}>
                              {status.docCount}
                            </span>
                          </div>
                        </div>

                        <div className={styles.recrawlSection}>
                          <p className={styles.hint}>
                            Content changed? Crawl again to update the index
                          </p>
                          <button
                            onClick={triggerCrawl}
                            className={styles.secondaryButton}
                            disabled={isCrawling}
                          >
                            {isCrawling ? (
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
                            ) : (
                              "Crawl Again"
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={triggerCrawl}
                          className={styles.primaryButton}
                          disabled={isCrawling || !domain || !status?.exists}
                        >
                          {isCrawling ? (
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
                          ) : (
                            "Crawl now"
                          )}
                        </button>
                        {!isStepCompleted(0) && (
                          <p className={styles.hint}>
                            {!domain
                              ? "Enter your domain in step 1 first"
                              : "Complete step 1 to set up your domain first"}
                          </p>
                        )}
                        {error && <div className={styles.error}>{error}</div>}
                      </>
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
                          placeholder="e.g., Help Center, Support"
                        />
                      </div>
                    </div>

                    <InstallationTabs
                      apiUrl={process.env.NEXT_PUBLIC_API_URL}
                      domain={domain}
                      theme={theme}
                      primaryColor={primaryColor}
                      title={title}
                    />

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
