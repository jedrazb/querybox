<div align="center">

<img src="./assets/querybox-logo.svg" alt="Querybox logo" width="400">

Lighweight, embeddable website search and chat widget

</div>



---

## 🎯 Overview

QueryBox is a complete solution for adding powerful search and AI-powered chat to any website. It consists of:

1. **Widget** (`packages/widget`) - Lightweight embeddable component
2. **API Backend** (`packages/api`) - Multi-tenant backend service
3. **Shared Types** (`packages/shared`) - Common TypeScript definitions

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Your Website                       │
│  <QueryBox apiEndpoint="..." />     │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  QueryBox API (Next.js)             │
│  - Multi-tenant                     │
│  - Handles all ES operations        │
│  - Built-in crawler                 │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  Elasticsearch Cloud                │
│  - Indices per domain               │
│  - Search & Agent capabilities      │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### For Website Owners (Using the Widget)

1. **Install the widget:**

```bash
npm install @jedrazb/querybox
```

2. **Add to your site:**

```typescript
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

const querybox = new QueryBox({
  apiEndpoint: "https://api.querybox.io/api/querybox/yoursite.com/v1",
});

// Add search button
document.getElementById("search-btn").onclick = () => querybox.search();

// Add chat button
document.getElementById("chat-btn").onclick = () => querybox.chat();
```

3. **Request your domain to be crawled:**

```bash
curl -X POST https://api.querybox.io/api/querybox/yoursite.com/v1/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "yoursite.com",
    "config": {
      "startUrl": "https://yoursite.com",
      "maxPages": 100
    }
  }'
```

### For API Operators (Self-hosting)

1. **Clone and install:**

```bash
git clone https://github.com/jedrazb/querybox.git
cd querybox
pnpm install
```

2. **Configure API:**

```bash
cd packages/api
cp env.example .env.local
# Edit .env.local with your Elasticsearch credentials
```

3. **Deploy to Vercel:**

```bash
cd packages/api
vercel
```

4. **Set environment variables in Vercel dashboard:**

- `ELASTICSEARCH_HOST`
- `ELASTICSEARCH_API_KEY`

## 📦 Packages

### Widget (`@jedrazb/querybox`)

Embeddable search and chat component with beautiful glassmorphic UI.

- 🎨 Beautiful, customizable UI
- 🔍 Instant search with highlighting
- 💬 AI-powered conversational chat
- 🌙 Dark/light theme support
- 📱 Fully responsive
- ⚡ Lightweight (~50KB gzipped)

[View Widget README](./packages/widget/README.md)

### API Backend

Full Next.js application with:

- **Landing page** - Beautiful, animated hero with setup flow
- **Interactive setup** - Real-time crawl progress tracking
- **API routes** - Multi-tenant backend (App Router)
- **Domain management** - Automatic indexing and configuration
- **Web crawler** - Built-in website crawling

[View App README](./packages/app/README.md)

### Shared Types

Common TypeScript definitions used by both widget and API.

## 🛠️ Development

### Quick Start

```bash
git clone https://github.com/jedrazb/querybox.git
cd querybox
pnpm install

# Configure Elasticsearch
cd packages/app
cp env.example .env.local
# Edit .env.local with your ES credentials

# Start development
cd ../..
pnpm dev:app
# Open http://localhost:3000
```

See [QUICK_START.md](./QUICK_START.md) for 3-minute setup guide or [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed instructions.

### Project Structure

```
querybox/
├── packages/
│   ├── widget/              # Embeddable widget (npm package)
│   │   ├── src/             # Widget source only
│   │   └── package.json
│   ├── app/                 # Next.js application
│   │   ├── src/
│   │   │   ├── app/         # App Router (pages + API routes)
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # ES client
│   │   │   └── services/    # Crawler
│   │   ├── docs/            # Documentation
│   │   └── examples/        # Integration examples
│   └── shared/              # Shared types
│       └── src/
├── pnpm-workspace.yaml
└── package.json
```

## 🔧 Configuration

### Widget Configuration

```typescript
interface QueryBoxConfig {
  apiEndpoint: string; // Required: API endpoint URL
  container?: HTMLElement | string; // Optional: Container element
  theme?: "light" | "dark" | "auto"; // Optional: Theme
  classNames?: {
    // Optional: Custom CSS classes
    panel?: string;
    searchPanel?: string;
    chatPanel?: string;
    overlay?: string;
  };
}
```

### API Configuration (Environment Variables)

| Variable                | Required | Description                 |
| ----------------------- | -------- | --------------------------- |
| `ELASTICSEARCH_HOST`    | Yes      | Elasticsearch instance URL  |
| `ELASTICSEARCH_API_KEY` | Yes      | ES API key with permissions |

## 📝 API Endpoints

All endpoints follow: `/api/querybox/{domain}/v1/{endpoint}`

- `POST /search` - Search documents
- `POST /chat` - Chat with AI agent
- `GET /status` - Domain status & config
- `POST /crawl` - Initiate website crawl

[View full API documentation](./packages/api/README.md)

## 🎨 Customization

### Custom Styles

```css
/* Override CSS variables */
:root {
  --querybox-primary: #your-color;
  --querybox-background: rgba(255, 255, 255, 0.9);
}
```

### Custom Classes

```typescript
new QueryBox({
  apiEndpoint: "...",
  classNames: {
    panel: "my-custom-panel",
    overlay: "my-custom-overlay",
  },
});
```

## 🚢 Deployment

### Widget (NPM)

```bash
cd packages/widget
pnpm build
npm publish
```

### App (Vercel)

```bash
cd packages/app
vercel --prod
```

Alternative platforms: Railway, Render, Netlify, AWS, Google Cloud

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [jedrazb](https://github.com/jedrazb)

## 🙏 Acknowledgments

- Built with [Elasticsearch](https://www.elastic.co/)
- UI inspired by glassmorphism design trends
- Powered by [Next.js](https://nextjs.org/) and [Vite](https://vitejs.dev/)

## 📧 Support

- 📫 Issues: [GitHub Issues](https://github.com/jedrazb/querybox/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jedrazb/querybox/discussions)
- 📖 Docs: [Documentation](./docs)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/jedrazb">jedrazb</a>
</div>
