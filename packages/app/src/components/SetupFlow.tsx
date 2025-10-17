"use client";

import { useState, useEffect } from "react";
import styles from "./SetupFlow.module.css";

interface SetupFlowProps {
  onClose: () => void;
}

type Step = "domain" | "crawling" | "complete";

interface CrawlStatus {
  status: "pending" | "crawling" | "completed" | "error";
  progress?: {
    pagesProcessed: number;
    totalPages: number;
  };
  error?: string;
}

export default function SetupFlow({ onClose }: SetupFlowProps) {
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [maxPages, setMaxPages] = useState(50);
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poll crawl status
  useEffect(() => {
    if (step !== "crawling" || !domain) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/${domain}/v1/status`);
        const data = await response.json();

        if (data.status === "active") {
          setStep("complete");
          setApiEndpoint(`/api/${domain}/v1`);
        } else if (data.status === "error") {
          setError("Crawl failed. Please try again.");
          setStep("domain");
        } else {
          setCrawlStatus(data);
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial poll

    return () => clearInterval(interval);
  }, [step, domain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Initiate crawl
      const response = await fetch(`/api/${domain}/v1/crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          config: {
            startUrl: startUrl || `https://${domain}`,
            maxPages,
            allowedDomains: [domain],
            crawlDepth: 3,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start crawl");
      }

      setStep("crawling");
    } catch (err: any) {
      setError(err.message || "Failed to start crawl");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {/* Step 1: Domain Input */}
        {step === "domain" && (
          <div className={styles.content}>
            <h2 className={styles.title}>Get Started with QueryBox</h2>
            <p className={styles.description}>
              Enter your domain and we'll crawl your website to create a
              searchable index.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Domain *</label>
                <input
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Start URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={startUrl}
                  onChange={(e) => setStartUrl(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Max Pages to Crawl</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  className={styles.input}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type="submit"
                className={styles.button}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Starting..." : "Start Crawling"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Crawling */}
        {step === "crawling" && (
          <div className={styles.content}>
            <div className={styles.spinner} />
            <h2 className={styles.title}>Crawling Your Website</h2>
            <p className={styles.description}>
              This may take a few minutes depending on your site size...
            </p>

            {crawlStatus?.progress && (
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        (crawlStatus.progress.pagesProcessed /
                          crawlStatus.progress.totalPages) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className={styles.progressText}>
                  {crawlStatus.progress.pagesProcessed} /{" "}
                  {crawlStatus.progress.totalPages} pages
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Complete */}
        {step === "complete" && (
          <div className={styles.content}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>All Set!</h2>
            <p className={styles.description}>
              Your domain has been crawled and indexed. Use this endpoint in
              your QueryBox widget:
            </p>

            <div className={styles.endpoint}>
              <code>{apiEndpoint}</code>
              <button
                className={styles.copyButton}
                onClick={() => copyToClipboard(apiEndpoint)}
              >
                Copy
              </button>
            </div>

            <div className={styles.codeExample}>
              <h3>Quick Setup</h3>
              <pre>
                <code>
                  {`npm install @jedrazb/querybox

import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

const querybox = new QueryBox({
  apiEndpoint: '${apiEndpoint}'
});

// Open search
querybox.search();

// Open AI chat
querybox.chat();`}
                </code>
              </pre>
            </div>

            <button className={styles.button} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </>
  );
}
