# QueryBox Documentation System

## 📖 Overview

QueryBox uses a **markdown-first documentation system** with a beautiful public website.

## 🏗️ Architecture

```
querybox/
├── docs/              # ✅ Markdown source (source of truth)
│   ├── README.md      # Documentation index
│   ├── QUICKSTART.md  # Getting started
│   ├── CONFIG.md      # Configuration
│   ├── STYLING.md     # Styling guide
│   ├── DESIGN.md      # Design system
│   └── ...           # More guides
│
├── public/            # 🌐 Website assets
│   ├── index.html     # Landing page
│   ├── styles.css     # Website styles
│   ├── docs/          # 🤖 Generated HTML (from markdown)
│   │   ├── QUICKSTART.html
│   │   ├── CONFIG.html
│   │   └── ...
│   ├── sitemap.xml    # SEO sitemap
│   └── robots.txt     # Crawler instructions
│
├── examples/          # 📝 Code examples
│   ├── nextjs-example.tsx
│   ├── wordpress-example.html
│   └── ...
│
└── scripts/           # 🛠️ Build tools
    └── build-docs.js  # Markdown → HTML converter
```

## ✨ Key Features

### 1. Markdown as Source of Truth

- All docs written in markdown (`docs/*.md`)
- Easy to edit, version control friendly
- Perfect for AI ingestion and search indexing
- Readable on GitHub

### 2. Beautiful Public Website

- Glassmorphism design matching the widget
- Responsive and mobile-friendly
- Live widget demos integrated
- Fast and SEO-optimized

### 3. Auto-Deploy to GitHub Pages

- Push to main → automatic deployment
- Documentation always up-to-date
- Free hosting with CDN

### 4. Search & Chat Ready

- Structured for Elasticsearch indexing
- Optimized for AI chat ingestion
- Clear hierarchy and cross-references
- Metadata for each document

## 🚀 Workflow

### Development

```bash
# 1. Edit markdown files in docs/
vim docs/QUICKSTART.md

# 2. Preview changes
pnpm dev
# Opens http://localhost:5173

# 3. Build HTML docs
pnpm build:docs

# 4. Build everything (widget + docs)
pnpm build:all
```

### Deployment

```bash
# Automatic: Push to main
git push origin main

# Manual: Build and deploy
pnpm build:all
# Deploy public/ folder to your host
```

## 📝 Writing Documentation

### File Structure

Each document should have:

```markdown
# Title (H1)

Brief introduction paragraph.

## Section (H2)

Content with examples.

### Subsection (H3)

Detailed information.

\`\`\`javascript
// Code examples with syntax highlighting
const example = 'code';
\`\`\`

## Another Section (H2)

More content...
```

### Best Practices

✅ **Do:**

- Use clear, descriptive headings
- Include practical code examples
- Add cross-references to related docs
- Keep paragraphs short and scannable
- Use lists and tables for clarity
- Add emoji for visual hierarchy 🎯

❌ **Don't:**

- Write long walls of text
- Use vague headings
- Forget code syntax highlighting
- Include outdated information
- Use complex jargon without explanation

### For Search Optimization

Each doc should have:

1. **Clear title** (H1) - main topic
2. **Sections** (H2) - subtopics
3. **Subsections** (H3) - specific details
4. **Keywords** - naturally throughout
5. **Examples** - practical use cases
6. **Links** - to related content

## 🔍 Search Indexing

### Elasticsearch Schema

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "english" },
      "content": { "type": "text", "analyzer": "english" },
      "section": { "type": "text" },
      "filename": { "type": "keyword" },
      "url": { "type": "keyword" },
      "type": { "type": "keyword" },
      "priority": { "type": "integer" }
    }
  }
}
```

### Indexing Script

```javascript
// Example: Index all docs
import fs from 'fs';
import path from 'path';

const docsDir = './docs';
const files = fs.readdirSync(docsDir);

files.forEach(file => {
  if (!file.endsWith('.md')) return;

  const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
  const title = content.match(/^# (.+)$/m)?.[1] || file;

  // Index to Elasticsearch
  await indexDocument({
    id: file.replace('.md', ''),
    title,
    content,
    filename: file,
    url: `https://jedrazb.github.io/querybox/docs/${file.replace('.md', '.html')}`,
    type: 'documentation'
  });
});
```

## 💬 AI Chat Ingestion

### Chunking Strategy

Split documents by H2 sections for better context:

```javascript
function chunkMarkdown(markdown, filename) {
  const sections = markdown.split(/^## /m);

  return sections.map((section, idx) => {
    const [title, ...content] = section.split("\n");

    return {
      id: `${filename}-${idx}`,
      filename,
      section: title,
      content: content.join("\n"),
      url: `https://jedrazb.github.io/querybox/docs/${filename}.html#${title
        .toLowerCase()
        .replace(/\s/g, "-")}`,
    };
  });
}
```

### Agent Configuration

```javascript
{
  "agent": "querybox-docs",
  "sources": [
    {
      "type": "markdown",
      "path": "docs/",
      "include": ["*.md"],
      "chunking": {
        "strategy": "heading",
        "level": 2,
        "max_tokens": 500
      }
    }
  ],
  "instructions": "You are a helpful assistant for QueryBox documentation. Provide accurate, code-focused answers with examples."
}
```

## 🌐 Website Customization

### Landing Page

Edit `public/index.html`:

- Hero section with main messaging
- Features showcase
- Live demo buttons
- Installation examples
- Documentation links

### Styles

Edit `public/styles.css`:

- Uses same glassmorphism design
- CSS variables for theming
- Responsive breakpoints
- Dark mode support

### Navigation

Add doc pages to navigation in `public/index.html`:

```html
<a href="docs/YOUR_DOC.html" class="doc-card">
  <h3>🎯 Your Doc Title</h3>
  <p>Description</p>
</a>
```

## 📊 Analytics & SEO

### Sitemap

Auto-generated in `public/sitemap.xml`:

- Lists all pages
- Priority and change frequency
- Submitted to search engines

### robots.txt

Controls crawler access:

```
User-agent: *
Allow: /
Sitemap: https://jedrazb.github.io/querybox/sitemap.xml
```

### Meta Tags

Each page includes:

- Title
- Description
- Viewport settings
- Canonical URLs

## 🔄 CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:

1. **Build widget** (`pnpm build`)
2. **Generate docs** (`pnpm build:docs`)
3. **Deploy to Pages**

### Manual Build

```bash
# Full build
pnpm build:all

# Widget only
pnpm build

# Docs only
pnpm build:docs
```

## 📦 Publishing Workflow

1. **Update docs** in `docs/` folder
2. **Test locally**: `pnpm dev`
3. **Commit changes**: `git commit -m "docs: update guide"`
4. **Push**: `git push origin main`
5. **Auto-deploy**: GitHub Actions deploys

## 🎯 Goals

This documentation system is designed to be:

✅ **Easy to maintain** - Markdown is simple
✅ **Beautiful** - Glassmorphism design
✅ **Searchable** - Optimized for indexing
✅ **AI-ready** - Perfect for chat ingestion
✅ **Fast** - Static site, CDN-ready
✅ **SEO-friendly** - Sitemap, meta tags
✅ **Open source** - Hosted on GitHub

## 📞 Support

- **Edit docs**: Submit PR to `docs/` folder
- **Report issues**: GitHub Issues
- **Questions**: GitHub Discussions

---

**Keep markdown as source of truth!** 📝
