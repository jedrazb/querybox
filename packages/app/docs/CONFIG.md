# QueryBox Configuration Guide

This guide explains how to configure the QueryBox widget for your application.

## Required Configuration

The QueryBox widget requires three essential parameters:

### 1. `host` (required)

The URL of your Elasticsearch or API host.

**Examples:**

- Elasticsearch Cloud: `https://my-deployment.es.us-central1.gcp.cloud.es.io`
- Self-hosted: `http://localhost:9200`
- Custom API: `https://api.mycompany.com`

```javascript
const querybox = new QueryBox({
  host: "https://my-deployment.es.cloud.es.io",
  // ...
});
```

### 2. `apiKey` (required)

Your API key for authentication. This key will be sent with all requests using the `Authorization: ApiKey <your-api-key>` header.

**How to get an API key:**

- **Elasticsearch Cloud**: Create an API key in Kibana > Stack Management > API Keys
- **Self-hosted Elasticsearch**: Use the `POST /_security/api_key` API
- **Custom API**: Refer to your API documentation

```javascript
const querybox = new QueryBox({
  host: "https://my-deployment.es.cloud.es.io",
  apiKey: "your-api-key",
  indexName: "my-website-content",
  // ...
});
```

### 3. `indexName` (required)

The name of your Elasticsearch index containing your crawled website content. This index will be used for all search queries.

**Examples:**

```javascript
const querybox = new QueryBox({
  host: "https://my-deployment.es.cloud.es.io",
  apiKey: "your-api-key",
  indexName: "my-website-content", // Your index name
});
```

**How to find your index name:**

- In Kibana: Go to Management > Index Management to see your indices
- Via API: `GET /_cat/indices` to list all indices
- Common naming patterns: `website-content`, `docs`, `search-content-*`

## Optional Configuration

### 4. `agentId` (optional)

The ID of your Elasticsearch agent for chat functionality. Only required if you want to use the chat feature.

```javascript
const querybox = new QueryBox({
  host: "https://my-deployment.es.cloud.es.io",
  apiKey: "your-api-key",
  indexName: "my-website-content",
  agentId: "my-chat-agent-id", // Optional
});
```

### 5. `theme` (optional)

Choose between `'light'`, `'dark'`, or `'auto'` themes. Defaults to `'auto'` (matches system preference).

```javascript
const querybox = new QueryBox({
  host: "...",
  apiKey: "...",
  indexName: "my-website-content",
  theme: "dark", // 'light', 'dark', or 'auto'
});
```

### 6. `container` (optional)

Specify where to mount the widget. Can be an HTMLElement or a CSS selector string. Defaults to `document.body`.

```javascript
const querybox = new QueryBox({
  host: "...",
  apiKey: "...",
  indexName: "my-website-content",
  container: "#app", // or document.getElementById('app')
});
```

### 7. `classNames` (optional)

Add custom CSS classes to widget elements for styling.

```javascript
const querybox = new QueryBox({
  host: "...",
  apiKey: "...",
  indexName: "my-website-content",
  classNames: {
    panel: "my-custom-panel",
    searchPanel: "my-search-panel",
    chatPanel: "my-chat-panel",
    overlay: "my-overlay",
  },
});
```

## Environment Variables (Next.js, React, etc.)

For Next.js or other frameworks using environment variables:

### Create `.env.local`:

```bash
# Required
NEXT_PUBLIC_HOST=https://your-host.es.cloud.es.io
NEXT_PUBLIC_API_KEY=your-api-key-here
NEXT_PUBLIC_INDEX_NAME=my-website-content

# Optional
NEXT_PUBLIC_AGENT_ID=your-agent-id
```

### Use in your code:

```javascript
const querybox = new QueryBox({
  host: process.env.NEXT_PUBLIC_HOST,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  indexName: process.env.NEXT_PUBLIC_INDEX_NAME,
  agentId: process.env.NEXT_PUBLIC_AGENT_ID,
});
```

## Security Best Practices

### ⚠️ Never commit API keys to version control

- Always use environment variables for sensitive data
- Add `.env.local` to your `.gitignore`
- Use different API keys for development and production

### 🔒 API Key Permissions

Create API keys with minimal required permissions:

**For search-only:**

```json
{
  "indices": [
    {
      "names": ["your-index-*"],
      "privileges": ["read"]
    }
  ]
}
```

**For search + chat:**

```json
{
  "indices": [
    {
      "names": ["your-index-*"],
      "privileges": ["read"]
    }
  ],
  "applications": [
    {
      "application": "elastic-agent",
      "privileges": ["read", "write"],
      "resources": ["agent:your-agent-id"]
    }
  ]
}
```

## CORS Configuration

If you're hosting your frontend on a different domain than your Elasticsearch instance, you'll need to configure CORS.

### Elasticsearch Cloud

Add your domain to the CORS allowed origins in Kibana:

1. Go to Stack Management > Advanced Settings
2. Find `http.cors.allow-origin`
3. Add your domain (e.g., `https://myapp.com`)

### Self-hosted Elasticsearch

Edit `elasticsearch.yml`:

```yaml
http.cors.enabled: true
http.cors.allow-origin: "https://myapp.com"
http.cors.allow-headers: "Authorization, Content-Type"
```

## Testing Your Configuration

Use the browser console to verify your configuration:

```javascript
const querybox = new QueryBox({
  host: "YOUR_HOST",
  apiKey: "YOUR_API_KEY",
  indexName: "YOUR_INDEX_NAME",
  agentId: "YOUR_AGENT_ID",
});

// Check configuration
console.log(querybox.getConfig());

// Test search
querybox.search();

// Test chat
querybox.chat();
```

## Troubleshooting

### Error: "QueryBox: host is required"

Make sure you're passing the `host` parameter to the constructor.

### Error: "QueryBox: apiKey is required"

Make sure you're passing the `apiKey` parameter to the constructor.

### Error: "QueryBox: indexName is required"

Make sure you're passing the `indexName` parameter to the constructor with the name of your Elasticsearch index containing crawled content.

### 401 Unauthorized

- Verify your API key is correct
- Check that the API key hasn't expired
- Ensure the API key has the necessary permissions

### CORS errors

- Configure CORS on your Elasticsearch instance
- Add your domain to allowed origins
- Check the `Authorization` header is allowed

### Search not working

- Verify your host URL is correct
- Test the endpoint directly with curl:
  ```bash
  curl -H "Authorization: ApiKey YOUR_API_KEY" \
       https://your-host.com/_search
  ```

### Chat not working

- Verify your agent ID is correct
- Check that the agent endpoint is accessible
- Ensure your API key has permissions to use the agent

## Full Configuration Example

```javascript
const querybox = new QueryBox({
  // Required
  host: "https://my-deployment.es.cloud.es.io",
  apiKey: "VnVhQmZrTUJDZGJrU...", // Base64 encoded
  indexName: "my-website-content",

  // Optional
  agentId: "my-agent-123",
  theme: "auto",
  container: document.getElementById("querybox-container"),
  classNames: {
    panel: "custom-panel",
    overlay: "custom-overlay",
  },
});
```

## Next Steps

- See [QUICKSTART.md](QUICKSTART.md) for a quick guide
- See [README.md](README.md) for full documentation
- Check [examples/](examples/) for integration examples
