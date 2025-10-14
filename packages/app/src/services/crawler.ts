/**
 * Basic web crawler service
 * This is a simple implementation - can be expanded with more sophisticated crawling
 */

import type { CrawlConfig, DomainConfig } from "@jedrazb/querybox-shared";
import type { ElasticsearchClient } from "@/lib/elasticsearch";

interface CrawlJob {
  domain: string;
  config: CrawlConfig;
  esClient: ElasticsearchClient;
}

// In-memory queue for crawl jobs (in production, use a proper job queue like Bull/BullMQ)
const crawlQueue: CrawlJob[] = [];
let isProcessing = false;

/**
 * Initiate a crawl job
 */
export function initiateCrawl(
  domain: string,
  config: CrawlConfig,
  esClient: ElasticsearchClient
): void {
  crawlQueue.push({ domain, config, esClient });

  if (!isProcessing) {
    processQueue();
  }
}

/**
 * Process the crawl queue
 */
async function processQueue(): Promise<void> {
  if (crawlQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const job = crawlQueue.shift();

  if (!job) {
    isProcessing = false;
    return;
  }

  try {
    await executeCrawl(job);
  } catch (error) {
    console.error(`Crawl failed for ${job.domain}:`, error);

    // Update domain config with error status
    try {
      const domainConfig = await job.esClient.getDomainConfig(job.domain);
      if (domainConfig) {
        domainConfig.status = "error";
        domainConfig.updatedAt = Date.now();
        await job.esClient.saveDomainConfig(domainConfig);
      }
    } catch (updateError) {
      console.error("Failed to update domain config:", updateError);
    }
  }

  // Process next job
  processQueue();
}

/**
 * Execute a crawl job
 */
async function executeCrawl(job: CrawlJob): Promise<void> {
  const { domain, config, esClient } = job;
  const {
    startUrl,
    maxPages = 50,
    allowedDomains,
    excludePatterns,
    crawlDepth = 3,
  } = config;

  console.log(`Starting crawl for ${domain} from ${startUrl}`);

  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [
    { url: startUrl, depth: 0 },
  ];
  const documents: Array<{ id: string; doc: Record<string, unknown> }> = [];

  const domainConfig = await esClient.getDomainConfig(domain);
  if (!domainConfig) {
    throw new Error("Domain config not found");
  }

  while (queue.length > 0 && visited.size < maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current.url)) continue;

    // Check depth limit
    if (current.depth > crawlDepth) continue;

    // Check if URL should be excluded
    if (
      excludePatterns &&
      excludePatterns.some((pattern) => current.url.includes(pattern))
    ) {
      continue;
    }

    visited.add(current.url);

    try {
      // Fetch the page
      const response = await fetch(current.url, {
        headers: {
          "User-Agent": "QueryBox-Crawler/1.0",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch ${current.url}: ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        continue;
      }

      const html = await response.text();

      // Extract content (basic implementation)
      const content = extractTextContent(html);
      const title = extractTitle(html);
      const links = extractLinks(html, current.url);

      // Create document
      const doc = {
        title,
        content,
        url: current.url,
        domain,
        crawledAt: new Date().toISOString(),
        metadata: {
          depth: current.depth,
        },
      };

      documents.push({
        id: Buffer.from(current.url).toString("base64"),
        doc,
      });

      // Add links to queue
      for (const link of links) {
        if (!visited.has(link) && shouldCrawlUrl(link, allowedDomains)) {
          queue.push({ url: link, depth: current.depth + 1 });
        }
      }

      // Batch index documents every 10 pages
      if (documents.length >= 10) {
        await esClient.bulkIndex(domainConfig.indexName, documents);
        console.log(`Indexed ${documents.length} documents for ${domain}`);
        documents.length = 0; // Clear array
      }

      // Be nice to the server
      await sleep(1000);
    } catch (error) {
      console.error(`Error crawling ${current.url}:`, error);
    }
  }

  // Index remaining documents
  if (documents.length > 0) {
    await esClient.bulkIndex(domainConfig.indexName, documents);
    console.log(`Indexed ${documents.length} documents for ${domain}`);
  }

  // Update domain config to active
  domainConfig.status = "active";
  domainConfig.updatedAt = Date.now();
  await esClient.saveDomainConfig(domainConfig);

  console.log(`Completed crawl for ${domain}. Indexed ${visited.size} pages.`);
}

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text.substring(0, 5000); // Limit content length
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "Untitled";
}

/**
 * Extract links from HTML
 */
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);

      // Only include http(s) links
      if (url.protocol === "http:" || url.protocol === "https:") {
        // Remove hash
        url.hash = "";
        links.push(url.href);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Check if URL should be crawled based on allowed domains
 */
function shouldCrawlUrl(url: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    return allowedDomains.some(
      (domain) =>
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
