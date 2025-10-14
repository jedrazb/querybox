# Deploying QueryBox Documentation

This guide explains how to deploy the QueryBox documentation website.

## 📦 What Gets Deployed

The documentation website includes:

- **Landing page** (`public/index.html`) - Beautiful homepage with demos
- **Documentation** (`docs/*.md` → `public/docs/*.html`) - All markdown docs converted to HTML
- **Widget** - Built QueryBox widget for live demos
- **Examples** - Code examples for reference

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

The repository includes GitHub Actions workflow for automatic deployment.

#### Setup:

1. **Enable GitHub Pages:**

   - Go to your repository settings
   - Navigate to "Pages"
   - Source: "GitHub Actions"

2. **Push to main branch:**

   ```bash
   git push origin main
   ```

3. **Workflow runs automatically:**

   - Builds the widget (`pnpm build`)
   - Converts docs to HTML (`pnpm build:docs`)
   - Deploys to GitHub Pages

4. **Access your site:**
   - https://jedrazb.github.io/querybox

#### Manual Deployment:

```bash
# Build everything
pnpm build:all

# The public/ folder is ready to deploy
```

### Option 2: Vercel

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   pnpm build:all
   vercel --prod
   ```

3. **Configure** `vercel.json`:
   ```json
   {
     "buildCommand": "pnpm build:all",
     "outputDirectory": "public",
     "cleanUrls": true
   }
   ```

### Option 3: Netlify

1. **Create** `netlify.toml`:

   ```toml
   [build]
     command = "pnpm build:all"
     publish = "public"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy:**

   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli

   # Deploy
   pnpm build:all
   netlify deploy --prod --dir=public
   ```

### Option 4: Cloudflare Pages

1. **Connect your repository** to Cloudflare Pages

2. **Build settings:**

   - Build command: `pnpm build:all`
   - Build output directory: `public`
   - Root directory: `/`

3. **Deploy:**
   - Automatic on push to main

## 📝 Build Commands

```bash
# Build the widget only
pnpm build

# Build documentation only (converts markdown to HTML)
pnpm build:docs

# Build everything (widget + docs)
pnpm build:all

# Preview locally
pnpm preview
```

## 🔍 Making Docs Searchable

The documentation structure is designed to be easily indexed:

### For Elasticsearch:

1. **Index the docs:**

   ```bash
   # All markdown files in docs/ folder
   curl -X POST "localhost:9200/querybox-docs/_doc" -H 'Content-Type: application/json' -d @docs/QUICKSTART.md
   ```

2. **Mapping:**

   ```json
   {
     "mappings": {
       "properties": {
         "title": { "type": "text" },
         "content": { "type": "text" },
         "url": { "type": "keyword" },
         "type": { "type": "keyword" }
       }
     }
   }
   ```

3. **Search:**
   Your QueryBox widget can now search the documentation!

### Document Structure:

Each doc page should have:

- **Title**: Extracted from first `# heading`
- **Content**: Full markdown content
- **URL**: `https://your-site.com/docs/FILENAME.html`
- **Type**: `documentation`

## 🤖 For AI Chat Ingestion

The markdown files in `docs/` are perfect for AI chat ingestion:

```javascript
// Example: Ingest docs for chat
const docs = [
  "docs/QUICKSTART.md",
  "docs/CONFIG.md",
  "docs/STYLING.md",
  // ... more docs
];

docs.forEach(async (doc) => {
  const content = await fs.readFile(doc, "utf-8");
  // Send to your agent builder API
  await ingestDocument({
    title: doc.replace("docs/", "").replace(".md", ""),
    content: content,
    type: "documentation",
  });
});
```

## 📊 Analytics

### Add Google Analytics

In `public/index.html`:

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Add Plausible Analytics

```html
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
></script>
```

## 🔧 Custom Domain

### GitHub Pages:

1. Add `CNAME` file in `public/`:

   ```
   docs.querybox.dev
   ```

2. Configure DNS:
   ```
   Type: CNAME
   Name: docs
   Value: jedrazb.github.io
   ```

### Vercel:

```bash
vercel domains add docs.querybox.dev
```

### Netlify:

Add domain in Netlify dashboard, follow DNS instructions.

## 📦 CDN Optimization

The built files are automatically optimized:

- CSS/JS minified
- HTML compressed
- Source maps available

### Additional Optimization:

1. **Enable caching headers** (in Netlify/Vercel):

   ```toml
   [[headers]]
     for = "/dist/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

2. **Compress assets:**
   ```bash
   # Install terser for additional compression
   npm i -D terser
   ```

## 🔐 Security Headers

Add to your hosting platform:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📈 SEO

The site includes:

- ✅ `sitemap.xml` - For search engines
- ✅ `robots.txt` - Crawler instructions
- ✅ Meta descriptions
- ✅ Semantic HTML
- ✅ Fast loading times

## 🚦 Status Page

Monitor your deployment:

- GitHub Pages: https://www.githubstatus.com/
- Vercel: https://www.vercel-status.com/
- Netlify: https://www.netlifystatus.com/

## 🆘 Troubleshooting

### GitHub Actions fails:

- Check permissions in Settings > Actions > General
- Ensure "Read and write permissions" is enabled

### Docs not building:

```bash
# Clean and rebuild
rm -rf public/docs
pnpm build:docs
```

### Widget not loading on site:

- Check browser console for errors
- Verify dist/ folder was built
- Check CORS settings if hosted separately

## 📞 Support

- **Issues**: https://github.com/jedrazb/querybox/issues
- **Discussions**: https://github.com/jedrazb/querybox/discussions

---

**Ready to deploy?** Run `pnpm build:all` and push to main! 🚀
