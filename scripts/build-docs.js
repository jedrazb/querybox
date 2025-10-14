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

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Simple markdown to HTML converter
function markdownToHtml(markdown, title) {
  // Basic conversion (in production, use a proper markdown library)
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Code blocks
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre><code class="language-$1">$2</code></pre>'
    )
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Lists
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    // Paragraphs
    .split("\n\n")
    .map((para) =>
      para.trim() && !para.startsWith("<") ? `<p>${para}</p>` : para
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - QueryBox Documentation</title>
  <link rel="stylesheet" href="../styles.css">
  <style>
    body { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 48px; margin-bottom: 24px; }
    h2 { font-size: 32px; margin-top: 48px; margin-bottom: 16px; }
    h3 { font-size: 24px; margin-top: 32px; margin-bottom: 12px; }
    pre { background: var(--bg-secondary); padding: 20px; border-radius: 12px; overflow-x: auto; }
    code { font-family: 'Monaco', 'Courier New', monospace; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    li { margin: 8px 0; }
    .back-link { display: inline-block; margin-bottom: 32px; color: var(--primary); }
  </style>
</head>
<body>
  <a href="../" class="back-link">← Back to Home</a>
  ${html}
</body>
</html>`;
}

// Convert all markdown files
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));

console.log("📝 Building documentation...\n");

files.forEach((file) => {
  const markdown = fs.readFileSync(path.join(docsDir, file), "utf-8");
  const title = file.replace(".md", "").replace(/[-_]/g, " ");
  const html = markdownToHtml(markdown, title);
  const outputFile = file.replace(".md", ".html");

  fs.writeFileSync(path.join(outputDir, outputFile), html);
  console.log(`✅ ${file} → docs/${outputFile}`);
});

console.log("\n✨ Documentation built successfully!");
