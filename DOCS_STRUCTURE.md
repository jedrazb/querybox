# 📚 Documentation Structure

This document outlines the streamlined documentation structure for public access.

## ✅ What's Included (Public)

### Essential Documentation (`/docs/`)

1. **[Quick Start](docs/QUICKSTART.md)** 🚀

   - 5-minute getting started guide
   - Installation and setup
   - Basic usage examples
   - Troubleshooting

2. **[Configuration](docs/CONFIG.md)** ⚙️

   - Complete configuration reference
   - Security best practices
   - API key management
   - CORS setup
   - Environment variables

3. **[Styling & Design](docs/STYLING.md)** 🎨

   - Apple glassmorphism design
   - Color system (light/dark)
   - CSS customization
   - Responsive design
   - Browser support

4. **[Contributing](docs/CONTRIBUTING.md)** 🤝
   - Development setup
   - Code style guidelines
   - Pull request process
   - Project structure

## 📁 Documentation Files

### Public Docs (`/docs/`)

```
docs/
├── README.md          # Documentation index
├── QUICKSTART.md      # Quick start guide
├── CONFIG.md          # Configuration reference
├── STYLING.md         # Styling & design guide
└── CONTRIBUTING.md    # Contributing guidelines
```

### Maintainer Docs (Root)

```
/
├── PUBLISHING.md      # npm publishing guide (maintainers only)
├── DEPLOYMENT.md      # Website deployment guide (maintainers only)
└── DOCUMENTATION.md   # Documentation writing guidelines (maintainers only)
```

### Generated Files (Auto-generated, git-ignored)

```
public/docs/
├── README.html
├── QUICKSTART.html
├── CONFIG.html
├── STYLING.html
└── CONTRIBUTING.html
```

## ❌ What Was Removed

Simplified by removing:

- ❌ **PACKAGE_MANAGERS.md** - Too detailed, installation covered in Quick Start
- ❌ **SETUP.md** - Redundant with Quick Start
- ❌ **DESIGN.md** - Merged into STYLING.md
- ❌ **INDEX.md** - Redundant, website provides navigation
- ❌ Separate publishing/deployment docs from public view (moved to root)

## 🌐 Documentation Website

### Homepage (`/public/index.html`)

- Hero section with demo
- Features showcase
- Quick installation tabs (npm, CDN, Next.js)
- Documentation links (4 essential docs)
- Beautiful glassmorphism design

### Documentation Pages

Auto-generated from Markdown:

- `https://yoursite.com/docs/QUICKSTART.html`
- `https://yoursite.com/docs/CONFIG.html`
- `https://yoursite.com/docs/STYLING.html`
- `https://yoursite.com/docs/CONTRIBUTING.html`

## 🚀 Building & Deploying

### Build Documentation

```bash
pnpm build:docs
```

### Build Everything

```bash
pnpm build:all  # Widget + docs
```

### Local Development

```bash
pnpm dev  # Opens documentation website at http://localhost:5173
```

### Deploy to GitHub Pages

Push to `main` branch → GitHub Actions automatically:

1. Builds the widget
2. Converts Markdown to HTML
3. Deploys to GitHub Pages

## ✨ Key Improvements

1. **Simplified Structure** - Only 4 essential docs for users
2. **Clear Separation** - Public docs in `/docs/`, maintainer docs in root
3. **Merged Content** - DESIGN + STYLING = comprehensive guide
4. **Easy Navigation** - Beautiful homepage with clear links
5. **Auto-Deploy** - Push to main = automatic deployment
6. **Search Ready** - Structured for Elasticsearch indexing
7. **Chat Ready** - Optimized for AI assistant ingestion

## 📝 Content Guidelines

### Each Doc Should Have:

- Clear title (H1)
- Table of contents for long docs
- Practical code examples
- Cross-references to related docs
- Clean, concise writing

### Formatting:

- Use `##` for main sections
- Use `###` for subsections
- Include code blocks with language hints
- Use tables for comparisons
- Include emojis for visual navigation

## 🔍 For Search Indexing

Each doc is structured for easy chunking:

- Clear H2 headings for section breaks
- Self-contained sections
- Practical examples in each section
- Metadata: filename, section title, doc type

### Example Chunk:

```json
{
  "id": "config-security",
  "file": "CONFIG.md",
  "section": "Security & CORS",
  "content": "...",
  "type": "reference",
  "url": "https://jedrazb.github.io/querybox/docs/CONFIG.html#security"
}
```

## ✅ Ready for Public Access

The documentation is now:

- ✅ Clean and focused
- ✅ Easy to navigate
- ✅ Beautiful design
- ✅ Mobile-friendly
- ✅ SEO-optimized
- ✅ Search-ready
- ✅ AI chat-ready
- ✅ Auto-deployable

---

**Run `pnpm dev` to see the documentation website!** 🚀
