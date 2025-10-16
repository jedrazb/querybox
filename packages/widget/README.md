<div align="center">

<img src="https://github.com/jedrazb/querybox/blob/main/assets/querybox-logo.svg" alt="QueryBox logo" width="400">

**Lightweight, embeddable search and AI chat widget powered by Elasticsearch**

[![npm version](https://img.shields.io/npm/v/@jedrazb/querybox?style=flat-square)](https://www.npmjs.com/package/@jedrazb/querybox)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[Demo](https://querybox-app.vercel.app) · [Documentation](https://querybox-app.vercel.app/docs) · [Get Started](https://querybox-app.vercel.app/get-started)

</div>

---

## Installation

```bash
npm install @jedrazb/querybox
```

## Usage

```typescript
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

const querybox = new QueryBox({
  apiEndpoint:
    "${process.env.NEXT_PUBLIC_API_URL}/api/querybox/yoursite.com/v1",
});

// Open search
document.getElementById("search-btn").onclick = () => querybox.search();

// Open chat
document.getElementById("chat-btn").onclick = () => querybox.chat();
```

## Documentation

For full documentation, visit: https://querybox-app.vercel.app

## License

MIT © [jedrazb](https://github.com/jedrazb)
