# 🔍 QueryBox Widget

A lightweight, embeddable JavaScript widget for search and AI chat powered by Elasticsearch.

> **📖 [View Documentation Website](https://jedrazb.github.io/querybox)** (or your deployed URL)

## ✨ Features

- **🔍 Search Panel** - Powerful search powered by Elasticsearch `_search` API
- **💬 Chat Assistant** - AI chat with streaming responses and tool usage visualization
- **📦 Multiple Integration Methods** - Works as npm package, UMD script, or ES module
- **✨ Apple Glassmorphism** - Beautiful frosted glass UI with backdrop blur effects
- **🎨 Light & Dark Mode** - Automatic theme switching based on system preferences
- **⚡ Built with Vite** - Fast development and optimized production builds
- **📱 Mobile Friendly** - Responsive design that works on all devices
- **🔧 Highly Configurable** - Easy to customize and extend

## 🚀 Quick Start

### Installation

#### Option 1: NPM Package

```bash
npm install @jedrazb/querybox
```

```javascript
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

const querybox = new QueryBox({
  host: "http://localhost:9200",
  apiKey: "your-api-key",
  indexName: "my-website-content",
  agentId: "my-agent-id",
});

// Open search or chat
querybox.search();
querybox.chat();
```

#### Option 2: Script Tag (UMD / CDN)

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@jedrazb/querybox/dist/style.css"
    />
  </head>
  <body>
    <button onclick="querybox.search()">Search</button>
    <button onclick="querybox.chat()">Chat</button>

    <script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>
    <script>
      const querybox = new QueryBox({
        host: "http://localhost:9200",
        apiKey: "your-api-key",
        indexName: "my-website-content",
        agentId: "my-agent-id",
      });
    </script>
  </body>
</html>
```

## 📖 Documentation

Visit the **[Documentation Website](https://jedrazb.github.io/querybox)** for comprehensive guides.

Essential docs:

- **[Quick Start](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Configuration](docs/CONFIG.md)** - Complete configuration reference
- **[Styling & Design](docs/STYLING.md)** - Customization and glassmorphism guide
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute

## 📖 Usage Examples

### Next.js

See [`examples/nextjs-example.tsx`](examples/nextjs-example.tsx) for a complete Next.js component example.

```tsx
"use client";

import { useEffect, useState } from "react";

export function QueryBoxWidget() {
  const [querybox, setQuerybox] = useState(null);

  useEffect(() => {
    import("@jedrazb/querybox").then(({ default: QueryBox }) => {
      import("@jedrazb/querybox/dist/style.css");

      const qb = new QueryBox({
        host: process.env.NEXT_PUBLIC_HOST,
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        indexName: process.env.NEXT_PUBLIC_INDEX_NAME,
        agentId: process.env.NEXT_PUBLIC_AGENT_ID,
      });

      setQuerybox(qb);
    });
  }, []);

  return (
    <div>
      <button onClick={() => querybox?.search()}>Search</button>
      <button onClick={() => querybox?.chat()}>Chat</button>
    </div>
  );
}
```

### WordPress

See [`examples/wordpress-example.html`](examples/wordpress-example.html) for WordPress integration.

### Plain HTML

See [`examples/standalone.html`](examples/standalone.html) for a standalone HTML example.

## ⚙️ Configuration

See **[Configuration Guide](docs/CONFIG.md)** for comprehensive configuration including security best practices, CORS setup, and troubleshooting.

See **[Styling & Design Guide](docs/STYLING.md)** for complete styling documentation including customization, themes, and glassmorphism effects.

### Quick Reference

```typescript
interface QueryBoxConfig {
  /** Host URL for the API (required) */
  host: string;

  /** API Key for authentication (required) */
  apiKey: string;

  /** Elasticsearch index name with crawled website content (required) */
  indexName: string;

  /** Agent ID for chat functionality (optional) */
  agentId?: string;

  /** Container element or selector (optional, defaults to document.body) */
  container?: HTMLElement | string;

  /** Theme: 'light', 'dark', or 'auto' (optional, defaults to 'auto') */
  theme?: "light" | "dark" | "auto";

  /** Custom CSS class names (optional) */
  classNames?: {
    panel?: string;
    searchPanel?: string;
    chatPanel?: string;
    overlay?: string;
  };
}
```

## 🎨 API Reference

### `QueryBox`

Main class for the widget.

#### Constructor

```typescript
new QueryBox(config: QueryBoxConfig)
```

#### Methods

- **`search(): void`** - Opens the search panel
- **`chat(): void`** - Opens the chat panel
- **`destroy(): void`** - Destroys the widget and cleans up
- **`getConfig(): QueryBoxConfig`** - Returns the current configuration

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm (recommended), npm, or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/jedrazb/querybox.git
cd querybox

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server (opens documentation website)
pnpm dev
```

The dev server will open at `http://localhost:5173` with the documentation website.

### Build

```bash
# Build for production
pnpm build

# Type check
pnpm type-check

# Preview production build
pnpm preview
```

### Project Structure

```
querybox/
├── src/
│   ├── index.ts              # Main entry point
│   ├── QueryBox.ts           # Main widget class
│   ├── types.ts              # TypeScript types
│   ├── components/           # UI components
│   │   ├── BasePanel.ts      # Base panel class
│   │   ├── SearchPanel.ts    # Search panel component
│   │   └── ChatPanel.ts      # Chat panel component
│   ├── api/                  # API clients
│   │   ├── elasticsearch.ts  # Elasticsearch client
│   │   └── chat-client.ts    # Chat/agent client
│   └── styles/               # CSS styles
│       └── main.css          # Main stylesheet
├── examples/                 # Usage examples
│   ├── index.html           # Interactive examples
│   ├── standalone.html      # UMD example
│   ├── nextjs-example.tsx   # Next.js example
│   └── wordpress-example.html # WordPress example
├── dist/                     # Build output
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Package manifest
```

## 🔌 API Integration

### Authentication

The widget uses API key authentication. Include your API key when initializing:

```javascript
const querybox = new QueryBox({
  host: "https://your-api-host.com",
  apiKey: "your-api-key",
  indexName: "my-website-content",
  agentId: "optional-agent-id",
});
```

All API requests include the `Authorization: ApiKey <your-api-key>` header.

### Elasticsearch Search

The widget uses Elasticsearch's `_search` API with:

- Multi-match queries across title, content, and description fields
- Fuzzy matching for typo tolerance
- Field boosting (title^2)
- Highlighting support

### Chat/Agent API

The widget expects a streaming chat API endpoint with:

- POST `/api/agents/{agentId}/converse`
- Streaming responses (SSE or NDJSON)
- Tool call and tool result support

## 🎯 Roadmap

Current scaffolding provides:

- ✅ Widget architecture and component structure
- ✅ Search and chat UI panels
- ✅ API client stubs for Elasticsearch and chat
- ✅ Multiple embedding methods (npm, UMD, ESM)
- ✅ **Apple glassmorphism design** with frosted glass effects
- ✅ Light/dark mode with automatic theme switching
- ✅ Smooth animations and micro-interactions
- ✅ Example implementations

Next steps:

- 🔄 Connect to real Elasticsearch endpoint
- 🔄 Integrate with agent builder converse API
- 🔄 Add comprehensive error handling
- 🔄 Add unit tests
- 🔄 Add keyboard navigation
- 🔄 Add accessibility improvements (ARIA labels, focus management)
- 🔄 Add result highlighting and snippets
- 🔄 Add chat history persistence
- 🔄 Add file upload support for chat
- 🔄 Add markdown rendering for chat responses

## 📦 NPM Package

The package is published as [`@jedrazb/querybox`](https://www.npmjs.com/package/@jedrazb/querybox) on npm.

### Installation

```bash
npm install @jedrazb/querybox
# or
pnpm add @jedrazb/querybox
# or
yarn add @jedrazb/querybox
```

### CDN Links

You can also use it directly from a CDN:

**unpkg:**

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@jedrazb/querybox/dist/style.css"
/>
<script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>
```

**jsDelivr:**

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@jedrazb/querybox/dist/style.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@jedrazb/querybox/dist/querybox.umd.js"></script>
```

## 📄 License

MIT

## 🌐 Documentation Website

The documentation is available as a beautiful website with glassmorphism design:

- **Local**: `pnpm dev` → `http://localhost:5173`
- **Production**: https://jedrazb.github.io/querybox (or your deployed URL)

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See **[Contributing Guide](docs/CONTRIBUTING.md)** for guidelines.
