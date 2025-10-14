# QueryBox Quick Start Guide

Get up and running with QueryBox in 5 minutes! 🚀

## Step 1: Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Start Development Server

```bash
pnpm dev
```

This will open your browser at `http://localhost:5173` with interactive examples!

## Step 4: Try the Widget

Click the buttons in the example page to see the search and chat panels in action.

## Step 5: Customize Configuration

Edit `examples/index.html` and update the configuration:

```javascript
const querybox = new QueryBox({
  host: "YOUR_HOST_URL",
  apiKey: "YOUR_API_KEY",
  indexName: "YOUR_INDEX_NAME", // Your Elasticsearch index with crawled content
  agentId: "YOUR_AGENT_ID",
  theme: "auto", // or 'light', 'dark'
});
```

## Step 6: Build for Production

```bash
pnpm build
```

This creates:

- `dist/querybox.umd.js` - For script tag usage
- `dist/querybox.es.js` - For npm/import usage
- `dist/style.css` - Styles
- `dist/index.d.ts` - TypeScript definitions

## Using the Built Widget

### In HTML (Script Tag)

```html
<link rel="stylesheet" href="dist/style.css" />
<script src="dist/querybox.umd.js"></script>

<script>
  const qb = new QueryBox({
    host: "...",
    apiKey: "...",
    indexName: "my-website-content",
  });
  qb.search(); // Open search
  qb.chat(); // Open chat
</script>
```

### In JavaScript/TypeScript (Module)

```javascript
// From npm
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

// Or from local build
import QueryBox from "./dist/querybox.es.js";
import "./dist/style.css";

const qb = new QueryBox({
  host: "...",
  apiKey: "...",
  indexName: "my-website-content",
});
qb.search();
qb.chat();
```

### In Next.js

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [qb, setQb] = useState(null);

  useEffect(() => {
    import("@jedrazb/querybox").then(({ default: QueryBox }) => {
      import("@jedrazb/querybox/dist/style.css");
      setQb(
        new QueryBox({
          host: "...",
          apiKey: "...",
          indexName: "my-website-content",
        })
      );
    });
  }, []);

  return (
    <>
      <button onClick={() => qb?.search()}>Search</button>
      <button onClick={() => qb?.chat()}>Chat</button>
    </>
  );
}
```

## Available Commands

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | Start development server with hot reload |
| `pnpm build`      | Build for production                     |
| `pnpm preview`    | Preview production build                 |
| `pnpm type-check` | Check TypeScript types                   |

> **Note:** You can also use `npm` or `yarn` instead of `pnpm` if you prefer.

## Next Steps

1. **Connect to Your API**: Update the `host` in your config
2. **Add API Key**: Set your `apiKey` for authentication
3. **Set Index Name**: Set your `indexName` to your Elasticsearch index with crawled content
4. **Configure Agent**: Set your `agentId` for chat functionality
5. **Customize Styling**: Override CSS variables in your stylesheet
6. **Add to Your Site**: Follow the integration guide in README.md

## Need Help?

- 📖 [Full Documentation](README.md)
- 🔧 [API Reference](README.md#api-reference)
- 💡 [Examples](examples/)
- 🤝 [Contributing](CONTRIBUTING.md)

## Troubleshooting

### Widget not showing?

- Check browser console for errors
- Verify CSS is loaded
- Ensure container element exists

### Search not working?

- Verify host URL is correct and accessible
- Check that your API key is valid and has proper permissions
- Check CORS settings on your API/Elasticsearch instance
- Look for network errors in browser DevTools

### Chat not streaming?

- Verify agent endpoint configuration
- Check that the API returns streaming responses
- Ensure WebSocket/SSE connections are allowed

---

**Happy coding!** 🎉
