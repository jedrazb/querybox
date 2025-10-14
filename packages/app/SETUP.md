# Local Development Setup

## Environment Configuration

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Then edit `.env.local`:

```bash
# Elasticsearch Configuration
ELASTICSEARCH_HOST=https://your-instance.es.cloud.es.io
ELASTICSEARCH_API_KEY=your_api_key_here

# Public API URL (exposed to client)
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production:
# NEXT_PUBLIC_API_URL=https://api.querybox.io

# Optional: For development
NODE_ENV=development
```

## Important: NEXT*PUBLIC* Variables

Any environment variable prefixed with `NEXT_PUBLIC_` is **exposed to the browser**. This means:

- ✅ `NEXT_PUBLIC_API_URL` - Safe to expose (it's your public API endpoint)
- ❌ `ELASTICSEARCH_HOST` - Never expose (keep server-side only)
- ❌ `ELASTICSEARCH_API_KEY` - Never expose (keep server-side only)

## Running Locally

```bash
# From the workspace root
pnpm dev:app

# Or from packages/app
pnpm dev
```

The widget demo on the landing page will automatically use `http://localhost:3000` as the API endpoint when running locally.

## Production

In production, set:

```bash
NEXT_PUBLIC_API_URL=https://api.querybox.io
```

Or use your custom domain for the API.
