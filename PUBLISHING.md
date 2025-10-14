# Publishing QueryBox to NPM

This guide explains how to publish the `@jedrazb/querybox` package to npm.

## 📦 Package Information

- **Package Name**: `@jedrazb/querybox`
- **NPM Registry**: https://www.npmjs.com/package/@jedrazb/querybox
- **Scope**: `@jedrazb` (user/organization scope)

## 🚀 Publishing Steps

### 1. Prerequisites

Ensure you have:

- An npm account
- Access to the `@jedrazb` scope (or it's your username)
- npm CLI installed and logged in

```bash
# Check if you're logged in
npm whoami

# If not logged in
npm login
```

### 2. Prepare for Publishing

#### Update version

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

#### Build the package

```bash
pnpm build
```

This creates:

- `dist/querybox.umd.js` - UMD build
- `dist/querybox.es.js` - ES Module build
- `dist/style.css` - Styles
- `dist/index.d.ts` - TypeScript definitions

### 3. Test the Package Locally

Test your package before publishing:

```bash
# Create a tarball
npm pack

# This creates jedrazb-querybox-0.1.0.tgz
# Install it in another project to test
cd /path/to/test-project
npm install /path/to/querybox/jedrazb-querybox-0.1.0.tgz
```

### 4. Publish to NPM

#### First time (public scoped package)

```bash
npm publish --access public
```

#### Subsequent releases

```bash
npm publish
```

### 5. Verify Publication

Check that your package is live:

```bash
# View on npm
open https://www.npmjs.com/package/@jedrazb/querybox

# Or test installation
npm install @jedrazb/querybox
```

## 📝 Pre-publish Checklist

Before publishing, ensure:

- [ ] `package.json` version is updated
- [ ] `pnpm build` runs without errors
- [ ] All tests pass (when available)
- [ ] `README.md` is up to date
- [ ] `CHANGELOG.md` is updated (if you maintain one)
- [ ] No sensitive information in the package
- [ ] `.npmignore` is properly configured
- [ ] Build artifacts exist in `dist/`
- [ ] TypeScript definitions are generated
- [ ] You're logged in to npm (`npm whoami`)

## 🔄 Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (0.1.x): Bug fixes, minor changes
- **MINOR** (0.x.0): New features, backward compatible
- **MAJOR** (x.0.0): Breaking changes

## 📋 What Gets Published

Files included in the npm package (from `package.json` `files` field):

```json
"files": [
  "dist"
]
```

Only the `dist/` folder is published, keeping the package lightweight.

## 🔐 Security

### Protecting Your Package

1. **Enable 2FA** on your npm account
2. **Use .npmignore** to exclude sensitive files
3. **Review `dist/`** before publishing
4. **Never commit** npm auth tokens

### Package Access

The package is **public** by default. To make it private:

```bash
npm publish --access restricted
```

(Requires a paid npm account for private scoped packages)

## 🏷️ NPM Tags

### Latest (default)

```bash
npm publish
```

Users install with: `npm install @jedrazb/querybox`

### Beta releases

```bash
npm publish --tag beta
```

Users install with: `npm install @jedrazb/querybox@beta`

### Specific versions

```bash
npm dist-tag add @jedrazb/querybox@1.2.3 stable
```

## 📚 CDN Usage

After publishing, your package is automatically available on CDNs:

### unpkg

```html
<script src="https://unpkg.com/@jedrazb/querybox"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/@jedrazb/querybox/dist/style.css"
/>
```

### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/@jedrazb/querybox"></script>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@jedrazb/querybox/dist/style.css"
/>
```

### With specific version

```html
<script src="https://unpkg.com/@jedrazb/querybox@0.1.0/dist/querybox.umd.js"></script>
```

## 🐛 Unpublishing (Use with Caution)

You can unpublish within 72 hours:

```bash
# Unpublish a specific version
npm unpublish @jedrazb/querybox@0.1.0

# Unpublish entire package (dangerous!)
npm unpublish @jedrazb/querybox --force
```

⚠️ **Warning**: Unpublishing can break projects depending on your package. Use deprecation instead:

```bash
npm deprecate @jedrazb/querybox@0.1.0 "This version has a critical bug, please upgrade"
```

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: "https://registry.npmjs.org"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Set `NPM_TOKEN` in your GitHub repository secrets.

## 📊 Package Stats

After publishing, monitor your package:

- **Downloads**: https://npm-stat.com/charts.html?package=@jedrazb/querybox
- **Bundle size**: https://bundlephobia.com/package/@jedrazb/querybox
- **Package health**: https://snyk.io/advisor/npm-package/@jedrazb/querybox

## 🎯 Post-publish Checklist

After publishing:

- [ ] Test installation: `npm install @jedrazb/querybox`
- [ ] Verify CDN links work
- [ ] Check package page: https://www.npmjs.com/package/@jedrazb/querybox
- [ ] Update documentation with new version
- [ ] Announce the release (social media, changelog, etc.)
- [ ] Monitor for issues

## 🆘 Troubleshooting

### "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Verify you own the `@jedrazb` scope
- Check if the package name is available

### "Package name too similar to existing package"

- npm might reject similar names
- Choose a more unique name

### "Missing required field: repository"

Add to `package.json`:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/jedrazb/querybox"
}
```

### Build fails

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

## 📞 Support

- **npm documentation**: https://docs.npmjs.com/
- **npm support**: https://www.npmjs.com/support
- **Package issues**: https://github.com/jedrazb/querybox/issues

---

**Ready to publish?** Make sure you've completed the checklist and run `npm publish --access public`! 🚀
