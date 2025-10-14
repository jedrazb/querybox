#!/usr/bin/env node
/**
 * Build script to convert markdown docs to HTML
 * This is a simple converter for documentation
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const outputDir = path.join(rootDir, "public", "docs");
const distDir = path.join(rootDir, "dist");
const publicDistDir = path.join(rootDir, "public", "dist");

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy dist files to public/dist for demo in docs
if (fs.existsSync(distDir)) {
  if (!fs.existsSync(publicDistDir)) {
    fs.mkdirSync(publicDistDir, { recursive: true });
  }

  // Copy widget files
  const filesToCopy = ["querybox.umd.js", "querybox.es.js", "style.css"];
  filesToCopy.forEach((file) => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(publicDistDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📦 Copied ${file} to public/dist/`);
    }
  });
}

/**
 * Extract headings for table of contents
 */
function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h2Match) {
      const text = h2Match[1].replace(/[^\w\s-]/g, "").trim();
      const id = text.toLowerCase().replace(/\s+/g, "-");
      headings.push({ level: 2, text, id });
    } else if (h3Match) {
      const text = h3Match[1].replace(/[^\w\s-]/g, "").trim();
      const id = text.toLowerCase().replace(/\s+/g, "-");
      headings.push({ level: 3, text, id });
    }
  }

  return headings;
}

/**
 * Generate table of contents HTML
 */
function generateTOC(headings) {
  if (headings.length === 0) return "";

  let html =
    '<nav class="toc">\n<div class="toc-title">Contents</div>\n<ul class="toc-list">\n';

  for (const heading of headings) {
    const indent = heading.level === 3 ? ' class="toc-item-h3"' : "";
    html += `  <li${indent}><a href="#${heading.id}" class="toc-link" data-target="${heading.id}">${heading.text}</a></li>\n`;
  }

  html += "</ul>\n</nav>";
  return html;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Process code blocks properly
 * Returns markdown with code blocks replaced by placeholders, and a map of replacements
 */
function extractCodeBlocks(markdown) {
  const codeBlocks = [];
  const placeholder = "___CODEBLOCK_";

  const processed = markdown.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const language = lang || "plaintext";
      const escapedCode = escapeHtml(code.trim());
      const html = `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
      codeBlocks.push(html);
      return `${placeholder}${codeBlocks.length - 1}___`;
    }
  );

  return { processed, codeBlocks, placeholder };
}

/**
 * Restore code blocks from placeholders
 */
function restoreCodeBlocks(html, codeBlocks, placeholder) {
  return html.replace(
    new RegExp(`${placeholder}(\\d+)___`, "g"),
    (match, index) => {
      return codeBlocks[parseInt(index)];
    }
  );
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown, title, filename) {
  // Extract headings for TOC
  const headings = extractHeadings(markdown);
  const toc = generateTOC(headings);

  // Extract code blocks first to avoid them being processed by other rules
  const { processed, codeBlocks, placeholder } = extractCodeBlocks(markdown);

  // Process remaining markdown
  let html = processed
    // Headers with IDs
    .replace(/^### (.+)$/gim, (match, text) => {
      const cleanText = text.replace(/[^\w\s-]/g, "").trim();
      const id = cleanText.toLowerCase().replace(/\s+/g, "-");
      return `<h3 id="${id}">${text}</h3>`;
    })
    .replace(/^## (.+)$/gim, (match, text) => {
      const cleanText = text.replace(/[^\w\s-]/g, "").trim();
      const id = cleanText.toLowerCase().replace(/\s+/g, "-");
      return `<h2 id="${id}">${text}</h2>`;
    })
    .replace(/^# (.+)$/gim, "<h1>$1</h1>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Inline code (after code blocks)
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes("---")) return "";
      const cells = match.split("|").filter((c) => c.trim());
      return (
        "<tr>" + cells.map((c) => `<td>${c.trim()}</td>`).join("") + "</tr>"
      );
    })
    // Lists - wrap in ul
    .replace(/((?:^- .+$\n?)+)/gim, "<ul>\n$1</ul>\n")
    .replace(/^- (.+)$/gim, "  <li>$1</li>")
    // Horizontal rules
    .replace(/^---$/gim, "<hr>")
    // Blockquotes
    .replace(/^> (.+)$/gim, "<blockquote>$1</blockquote>")
    // Paragraphs
    .split("\n\n")
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      // Check if it's a placeholder for code block
      if (trimmed.includes(placeholder)) return trimmed;
      if (trimmed.startsWith("<")) return trimmed;
      // Check if it's a list item line
      if (trimmed.includes("<li>")) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");

  // Restore code blocks
  html = restoreCodeBlocks(html, codeBlocks, placeholder);

  const contentClass = headings.length > 0 ? "doc-layout" : "doc-layout-no-toc";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - QueryBox Documentation</title>
  <link rel="stylesheet" href="/querybox/styles.css">
  <link rel="stylesheet" href="/querybox/dist/style.css">
  <style>
    /* Documentation layout */
    .doc-header {
      position: sticky;
      top: 0;
      background: var(--glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      z-index: 100;
      padding: 16px 0;
    }

    .doc-header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .doc-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }

    .doc-nav {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .doc-nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .doc-nav a:hover {
      color: var(--primary);
    }

    .demo-search-btn,
    .demo-chat-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
    }

    .demo-search-btn:hover,
    .demo-chat-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .demo-search-btn svg,
    .demo-chat-btn svg {
      display: block;
    }

    .doc-layout {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 60px;
      padding: 40px 24px 80px;
      position: relative;
    }

    .doc-layout-no-toc {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    /* Table of Contents */
    .toc {
      position: sticky;
      top: 100px;
      height: fit-content;
      max-height: calc(100vh - 140px);
      overflow-y: auto;
      padding: 24px 0;
    }

    .toc-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-list li {
      margin: 0;
    }

    .toc-list li.toc-item-h3 {
      padding-left: 16px;
    }

    .toc-link {
      display: block;
      padding: 8px 12px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
      border-radius: 6px;
      transition: all 0.2s;
      border-left: 2px solid transparent;
    }

    .toc-link:hover {
      color: var(--text);
      background: var(--bg-secondary);
    }

    .toc-link.active {
      color: var(--primary);
      background: var(--bg-secondary);
      border-left-color: var(--primary);
      font-weight: 600;
    }

    /* Content */
    .doc-content {
      min-width: 0;
      max-width: 900px;
    }

    .doc-content h1 {
      font-size: 48px;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }

    .doc-content h2 {
      font-size: 32px;
      margin-top: 48px;
      margin-bottom: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .doc-content h2:first-of-type {
      margin-top: 32px;
    }

    .doc-content h3 {
      font-size: 24px;
      margin-top: 32px;
      margin-bottom: 12px;
    }

    .doc-content p {
      margin: 16px 0;
      line-height: 1.7;
    }

    .doc-content ul {
      margin: 16px 0;
      padding-left: 24px;
    }

    .doc-content li {
      margin: 8px 0;
      line-height: 1.6;
    }

    .doc-content pre {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 24px 0;
      border: 1px solid var(--border);
    }

    .doc-content code {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 14px;
    }

    .doc-content pre code {
      display: block;
      line-height: 1.6;
      color: var(--text);
    }

    .doc-content .inline-code {
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      border: 1px solid var(--border);
    }

    .doc-content a {
      color: var(--primary);
      text-decoration: none;
    }

    .doc-content a:hover {
      text-decoration: underline;
    }

    .doc-content strong {
      font-weight: 600;
    }

    .doc-content hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 32px 0;
    }

    .doc-content blockquote {
      border-left: 4px solid var(--primary);
      padding: 12px 20px;
      margin: 20px 0;
      background: var(--bg-secondary);
      border-radius: 0 8px 8px 0;
    }

    .doc-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }

    .doc-content td {
      padding: 12px;
      border: 1px solid var(--border);
    }

    .doc-content tr:first-child {
      background: var(--bg-secondary);
      font-weight: 600;
    }

    /* Footer */
    .doc-footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      padding: 40px 0;
      margin-top: 60px;
    }

    .doc-footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
    }

    .doc-footer-links {
      display: flex;
      gap: 24px;
    }

    .doc-footer-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .doc-footer-links a:hover {
      color: var(--primary);
    }

    .doc-footer-copy {
      color: var(--text-secondary);
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .doc-layout {
        grid-template-columns: 200px 1fr;
        gap: 40px;
      }
    }

    @media (max-width: 768px) {
      .doc-layout {
        grid-template-columns: 1fr;
      }

      .toc {
        position: relative;
        top: 0;
        max-height: none;
        border-bottom: 1px solid var(--border);
        padding-bottom: 24px;
        margin-bottom: 24px;
      }

      .doc-content h1 {
        font-size: 36px;
      }

      .doc-content h2 {
        font-size: 28px;
      }

      .doc-content h3 {
        font-size: 20px;
      }

      .demo-search-btn,
      .demo-chat-btn {
        display: none;
      }
    }

    /* Keyboard shortcut hint */
    @media (min-width: 769px) {
      .demo-search-btn::after,
      .demo-chat-btn::after {
        content: attr(data-shortcut);
        position: absolute;
        bottom: -28px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        color: var(--text-secondary);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      .demo-search-btn {
        position: relative;
      }

      .demo-search-btn::after {
        content: '⌘K';
      }

      .demo-chat-btn {
        position: relative;
      }

      .demo-chat-btn::after {
        content: '⌘/';
      }

      .demo-search-btn:hover::after,
      .demo-chat-btn:hover::after {
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div class="doc-header-content">
      <a href="/querybox/" class="doc-logo">
        <span>🔍</span>
        <span>QueryBox</span>
      </a>
      <nav class="doc-nav">
        <a href="/querybox/">Home</a>
        <a href="/querybox/docs/README.html">Docs</a>
        <a href="https://github.com/jedrazb/querybox" target="_blank">GitHub</a>
        <button class="demo-search-btn" onclick="queryboxDemo?.search()" title="Try Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button class="demo-chat-btn" onclick="queryboxDemo?.chat()" title="Try Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </nav>
    </div>
  </header>

  <div class="${contentClass}">
    ${headings.length > 0 ? toc : ""}
    <main class="doc-content">
  ${html}
    </main>
  </div>

  <footer class="doc-footer">
    <div class="doc-footer-content">
      <div class="doc-footer-copy">
        © ${new Date().getFullYear()} QueryBox. MIT License.
      </div>
      <div class="doc-footer-links">
        <a href="/querybox/docs/QUICKSTART.html">Quick Start</a>
        <a href="/querybox/docs/CONFIG.html">Configuration</a>
        <a href="/querybox/docs/STYLING.html">Styling</a>
        <a href="/querybox/docs/CONTRIBUTING.html">Contributing</a>
      </div>
    </div>
  </footer>

  ${
    headings.length > 0
      ? `<script>
    // Intersection Observer for TOC active state
    document.addEventListener('DOMContentLoaded', () => {
      const tocLinks = document.querySelectorAll('.toc-link');
      const headings = document.querySelectorAll('h2[id], h3[id]');

      // Smooth scroll for TOC links
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('data-target');
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL without triggering scroll
            history.pushState(null, '', '#' + targetId);
          }
        });
      });

      // Intersection Observer options
      const observerOptions = {
        rootMargin: '-100px 0px -66%',
        threshold: 0
      };

      // Track which heading is currently intersecting
      let activeId = null;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;

            // Update active state
            tocLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('data-target') === activeId) {
                link.classList.add('active');
              }
            });
          }
        });
      }, observerOptions);

      // Observe all headings
      headings.forEach(heading => observer.observe(heading));

      // Set initial active state based on URL hash
      if (window.location.hash) {
        const initialId = window.location.hash.substring(1);
        tocLinks.forEach(link => {
          if (link.getAttribute('data-target') === initialId) {
            link.classList.add('active');
          }
        });
      } else if (headings.length > 0) {
        // Set first heading as active by default
        const firstId = headings[0].id;
        tocLinks.forEach(link => {
          if (link.getAttribute('data-target') === firstId) {
            link.classList.add('active');
          }
        });
      }
    });
  </script>`
      : ""
  }

  <!-- QueryBox Widget Demo -->
  <script src="/querybox/dist/querybox.umd.js"></script>
  <script>
    // Initialize QueryBox widget for demo
    // Note: Replace with your actual configuration
    try {
      window.queryboxDemo = new QueryBox({
        host: 'https://your-elasticsearch-host.com',
        apiKey: 'your-api-key',
        agentId: 'your-agent-id', // Optional for chat
        theme: 'auto',
        // You can customize the appearance
        classNames: {
          searchPanel: 'custom-search',
          chatPanel: 'custom-chat'
        }
      });

      // Add keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          window.queryboxDemo?.search();
        }
        // Cmd/Ctrl + / for chat
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
          e.preventDefault();
          window.queryboxDemo?.chat();
        }
      });
    } catch (error) {
      console.log('QueryBox demo initialization:', error.message);
      console.log('To enable the demo, configure your Elasticsearch host and API key in the script.');
    }
  </script>
</body>
</html>`;
}

// Convert all markdown files
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));

console.log("📝 Building documentation...\n");

files.forEach((file) => {
  const markdown = fs.readFileSync(path.join(docsDir, file), "utf-8");
  const title = file.replace(".md", "").replace(/[-_]/g, " ");
  const html = markdownToHtml(markdown, title, file);
  const outputFile = file.replace(".md", ".html");

  fs.writeFileSync(path.join(outputDir, outputFile), html);
  console.log(`✅ ${file} → docs/${outputFile}`);
});

console.log("\n✨ Documentation built successfully!");
