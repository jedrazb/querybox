<div align="center">

<img src="./assets/querybox-logo.svg" alt="QueryBox logo" width="400">

**Lightweight, embeddable search and AI chat widget powered by Elasticsearch**

[![npm version](https://img.shields.io/npm/v/@jedrazb/querybox?style=flat-square)](https://www.npmjs.com/package/@jedrazb/querybox)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)

[Demo](https://www.querybox.dev) · [Documentation](https://www.querybox.dev/docs) · [Get Started](https://www.querybox.dev/get-started)

</div>

---

## What is QueryBox?

QueryBox adds semantic search and AI-powered chat to your website in minutes. Your content is crawled, indexed with ELSER, and exposed through a beautiful widget - no backend code required.

**Key Features:**

- **Semantic Search** - ELSER-powered search with intelligent ranking
- **AI Chat** - Conversational interface powered by Elastic Agent Builder
- **Beautiful UI** - Glassmorphic design with dark/light themes
- **Lightweight** - ~50KB gzipped, zero dependencies

## Quick Start

### Installation

```bash
npm install @jedrazb/querybox
# or
pnpm add @jedrazb/querybox
```

### Usage

```javascript
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

const querybox = new QueryBox({
  apiEndpoint: "https://api.querybox.dev/{yoursite.com}/v1",
  theme: "auto",
  primaryColor: "#6366f1",
  initialQuestions: [
    "How do I get started?",
    "What are the pricing options?",
    "How do I integrate with React?",
  ],
});

// Open search or chat
querybox.search();
querybox.chat();
```

**Interactive Setup:** Visit [querybox.dev/get-started](https://www.querybox.dev/get-started) to crawl your site, configure the widget, and get installation code for your framework.

### Self-Hosting

```bash
git clone https://github.com/jedrazb/querybox.git
cd querybox && pnpm install

# Configure Elasticsearch
cd packages/app && cp env.example .env.local
# Add ELASTICSEARCH_HOST and ELASTICSEARCH_API_KEY

# Start development server
cd ../.. && pnpm dev:app
```

Deploy to Vercel, Railway, or any Next.js-compatible platform.

## Architecture

QueryBox is a monorepo with three packages:

| Package           | Description                          |
| ----------------- | ------------------------------------ |
| `packages/widget` | Embeddable TypeScript widget (~50KB) |
| `packages/app`    | Next.js API + landing page + crawler |
| `packages/shared` | Shared TypeScript types              |

## Configuration

**Widget Options:**

```typescript
{
  apiEndpoint: string;        // Required - Your API URL
  theme?: 'light'|'dark'|'auto';  // Default: 'auto'
  primaryColor?: string;      // Default: '#007aff'
  title?: string;             // Optional header title
  initialQuestions?: string[];  // Optional suggested questions (max 3)
  container?: HTMLElement|string;
  classNames?: { panel, overlay, ... }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev:app        # Start Next.js dev server
pnpm dev:widget     # Watch widget changes

# Testing
pnpm test           # Run tests
pnpm lint           # Lint code
```

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a PR.

## 📄 License

MIT © [jedrazb](https://github.com/jedrazb)

## 🔗 Links

- [Website](https://www.querybox.dev)
- [Documentation](https://www.querybox.dev/docs)
- [npm Package](https://www.npmjs.com/package/@jedrazb/querybox)
- [Issues](https://github.com/jedrazb/querybox/issues)

---

<div align="center">

**Built with** [Elasticsearch](https://www.elastic.co/) · [Next.js](https://nextjs.org/) · [TypeScript](https://www.typescriptlang.org/)

Made with ❤️ by [jedrazb](https://github.com/jedrazb)

</div>
