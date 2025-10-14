# QueryBox API

Backend API service for QueryBox widget. Handles Elasticsearch proxy, domain management, and web crawling.

## Features

- **Multi-tenant**: Serve multiple domains from a single API instance
- **Search API**: Proxy search requests to Elasticsearch
- **Chat API**: Handle conversational queries with Elasticsearch agents
- **Crawler**: Automatically crawl and index websites
- **Domain Management**: Track domain configurations and status

## API Endpoints

All endpoints follow the pattern: `/api/querybox/{domain}/v1/{endpoint}`

### Search

```
POST /api/querybox/{domain}/v1/search
```

Body:

```json
{
  "query": "search terms",
  "size": 10,
  "from": 0
}
```

### Chat

```
POST /api/querybox/{domain}/v1/chat
```

Body:

```json
{
  "message": "user question",
  "conversationId": "optional-conversation-id"
}
```

### Status

```
GET /api/querybox/{domain}/v1/status
```

Returns domain configuration and document count.

### Crawl

```
POST /api/querybox/{domain}/v1/crawl
```

Body:

```json
{
  "domain": "example.com",
  "config": {
    "startUrl": "https://example.com",
    "maxPages": 50,
    "crawlDepth": 3,
    "allowedDomains": ["example.com"],
    "excludePatterns": ["/admin", "/private"]
  }
}
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy from the API package:

```bash
cd packages/api
vercel
```

3. Set environment variables in Vercel dashboard:

- `ELASTICSEARCH_HOST`: Your Elasticsearch instance URL
- `ELASTICSEARCH_API_KEY`: Your Elasticsearch API key

### Other Platforms

This is a standard Next.js application and can be deployed to:

- Vercel
- Netlify
- Railway
- Render
- Any Node.js hosting platform

## Development

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local`:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```bash
ELASTICSEARCH_HOST=https://your-instance.es.cloud.es.io
ELASTICSEARCH_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run development server:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable                | Required | Description                                             | Exposed to Browser |
| ----------------------- | -------- | ------------------------------------------------------- | ------------------ |
| `ELASTICSEARCH_HOST`    | Yes      | Elasticsearch instance URL                              | No                 |
| `ELASTICSEARCH_API_KEY` | Yes      | Elasticsearch API key with index/search permissions     | No                 |
| `NEXT_PUBLIC_API_URL`   | Yes      | Public API URL for widget (e.g., http://localhost:3000) | Yes                |
| `NODE_ENV`              | No       | Environment (development/production)                    | No                 |

## How It Works

### Multi-tenancy

Each domain gets:

- Its own Elasticsearch index: `querybox_{domain}`
- Configuration stored in `querybox_configs` index
- Optional dedicated Elasticsearch agent

### Crawling

The crawler:

1. Fetches pages starting from `startUrl`
2. Extracts text content and links
3. Indexes documents in batches
4. Respects `maxPages` and `crawlDepth` limits
5. Can filter by `allowedDomains` and `excludePatterns`

### CORS

All endpoints return CORS headers allowing requests from any origin, making the API suitable for embedded widgets.

## License

MIT
