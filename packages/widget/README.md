# @jedrazb/querybox

> Lightweight embeddable search and chat widget powered by Elasticsearch

[![npm version](https://img.shields.io/npm/v/@jedrazb/querybox.svg)](https://www.npmjs.com/package/@jedrazb/querybox)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @jedrazb/querybox
```

## Usage

```typescript
import QueryBox from "@jedrazb/querybox";
import "@jedrazb/querybox/dist/style.css";

const querybox = new QueryBox({
  apiEndpoint: "https://api.querybox.io/api/querybox/yoursite.com/v1",
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
