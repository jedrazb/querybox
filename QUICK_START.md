# Quick Start - Run Locally in 3 Minutes

## 1. Install Dependencies

```bash
git clone https://github.com/jedrazb/querybox.git
cd querybox
pnpm install
```

## 2. Configure Elasticsearch

```bash
cd packages/app
cp env.example .env.local
```

Edit `.env.local` with your Elasticsearch credentials:

```bash
ELASTICSEARCH_HOST=https://your-instance.es.cloud.es.io
ELASTICSEARCH_API_KEY=your_api_key_here
```

## 3. Start Development

**From root directory:**

```bash
pnpm dev:app
```

Open http://localhost:3000 🎉

## What You'll See

1. **Landing page** with animated hero
2. Click **"Get Started"** button
3. Enter a domain (e.g., `test.com`)
4. Watch it crawl your site in real-time
5. Get your custom API endpoint
6. Copy code snippet and use!

## Testing the Widget

Once you have a crawled domain:

```bash
# Terminal 1 - Keep app running
pnpm dev:app

# Terminal 2 - Build widget
cd packages/widget
pnpm build
```

Create `test.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="./packages/widget/dist/style.css" />
  </head>
  <body>
    <button onclick="querybox.search()">Search</button>
    <button onclick="querybox.chat()">Chat</button>

    <script src="./packages/widget/dist/querybox.umd.js"></script>
    <script>
      const querybox = new QueryBox({
        apiEndpoint: "http://localhost:3000/api/querybox/test.com/v1",
      });
    </script>
  </body>
</html>
```

Open `test.html` in browser!

## Troubleshooting

**Port 3000 in use?**

```bash
lsof -ti:3000 | xargs kill -9
```

**ES connection failed?**

- Check credentials in `.env.local`
- Test: `curl -H "Authorization: ApiKey YOUR_KEY" YOUR_ES_HOST`

**Need help?**
See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed guide.

---

That's it! You're running QueryBox locally. 🚀
