# @token-ring/newsrpm

Integration package for NewsRPM within the TokenRing ecosystem. It provides:

- A NewsRPMService to talk to a NewsRPM API instance (search, fetch, upload articles)
- Ready-to-use tool definitions (for the TokenRing tools registry)
- A /newsrpm chat command for interactive use in the TokenRing REPL

## What is NewsRPM?
NewsRPM is an API for storing, indexing, and retrieving news articles and related metadata. This package wraps common API calls and exposes them as services, tools, and chat commands so they can be used by TokenRing agents and templates.

## Features
- Search indexed data by taxonomy keys (e.g., ticker, topic)
- Search articles by publisher, provider, type, full-text, and more
- Retrieve articles by slug or id
- List providers
- Fetch article bodies (native or rendered HTML)
- Upload articles to a NewsRPM instance
- Configurable authentication modes, retry policy, headers, and timeouts

## Installation
This package is part of the tokenring-writer repository. When used inside the project, it can be enabled in the registry like other TokenRing packages. See src/tr-writer.ts for how packages are added and tools are enabled.

If you are integrating it into your own TokenRing app, ensure the package is available and register it:

```ts
import * as NewsRPMPackage from "@token-ring/newsrpm";
import { NewsRPMService } from "@token-ring/newsrpm";
import { Registry } from "@token-ring/registry";

const registry = new Registry();
await registry.start();
await registry.addPackages(NewsRPMPackage);
await registry.services.addServices(new NewsRPMService({ apiKey: process.env.NEWSRPM_API_KEY! }));
// Optionally enable tools from this package via registry.tools.enableTools([...])
```

## Configuration
The NewsRPMService accepts the following configuration (all optional except apiKey):

- apiKey: string (required) — API key for your NewsRPM instance.
- authMode: 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery' (default: 'privateHeader') — How to send credentials.
- baseUrl: string (default: https://api.newsrpm.com) — Base URL of the NewsRPM API.
- requestDefaults:
  - headers: Record<string,string> — Additional headers to send with each request.
  - timeoutMs: number (default: 30000) — Request timeout in milliseconds.
- retry:
  - maxRetries: number (default: 3)
  - baseDelayMs: number (default: 500)
  - maxDelayMs: number (default: 4000)
  - jitter: boolean (default: true)

Example TokenRing writer configuration (.tokenring/writer-config.js):

```js
export default {
  newsrpm: {
    apiKey: process.env.NEWSRPM_API_KEY,
    baseUrl: process.env.NEWSRPM_BASE_URL || 'https://api.newsrpm.com',
    authMode: 'privateHeader',
    requestDefaults: { timeoutMs: 20000 },
    retry: { maxRetries: 5, baseDelayMs: 400, jitter: true },
  },
  // ... other config
};
```

## Exposed Tools
These tools are exported via pkg/newsrpm/tools.ts and can be enabled through the TokenRing tools registry.

- searchIndexedData: Search indexed data by key/value.
  - Params: key (string, required), value (string | string[]), count (number), offset (number), minDate (ISO string), maxDate (ISO string), order ('date' | 'dateWithQuality')
- searchArticles: Search articles by various filters.
  - Params: publisher (string | string[]), provider (string | string[]), fullText (string), type (string | string[]), sponsored (boolean), count (number), offset (number), minDate (ISO string), maxDate (ISO string), language (string)
- getArticleBySlug: Retrieve an article by slug.
  - Params: slug (string, required)
- getArticleById: Retrieve an article by numeric id.
  - Params: id (number, required)
- listProviders: List available providers.
  - Params: none
- getBody: Get article body in the native format.
  - Params: bodyId (string, required)
- renderBody: Get article body rendered as HTML.
  - Params: bodyId (string, required)
- uploadArticle: Create or update an article.
  - Params: article (object, required). See the OpenAPI schema reference below for full shape.

## Chat Command
This package provides a /newsrpm command usable in the TokenRing REPL.

Usage: /newsrpm [index|search|article|providers|body|upload]

- index <key> [--value <str|csv>] [--count n] [--offset n] [--min iso] [--max iso] [--order date|dateWithQuality]
- search [--publisher csv] [--provider csv] [--type csv] [--fulltext str] [--sponsored true|false] [--count n] [--offset n] [--min iso] [--max iso] [--language str]
- article slug <slug>
- article id <id>
- providers
- body <bodyId> [--render]
- upload --json <path>

Common option: --save <path> will write the raw JSON response to a file.

## Service API Summary
The NewsRPMService class implements:

- searchIndexedData(body)
- searchArticles(body)
- getArticleBySlug(slug)
- getArticleById(id)
- listProviders()
- getBody(bodyId)
- renderBody(bodyId)
- uploadArticle(article)

All methods throw on HTTP errors and include status and details when available. 429 and 5xx responses automatically retry according to the configured retry policy; timeouts are retried up to maxRetries.

## Authentication
Supported modes:

- privateHeader: Authorization: privateKey <apiKey>
- publicHeader: Authorization: publicKey <apiKey>
- privateQuery: Adds T=<apiKey> to the query string
- publicQuery: Adds P=<apiKey> to the query string

Choose the mode that matches your NewsRPM deployment.

## OpenAPI and Schema Reference
- OpenAPI: pkg/newsrpm/design/newsrpm.openapi.json
- Text summary: pkg/newsrpm/design/newsrpm_api.txt

For the uploadArticle payload shape, see components/schemas/article in the OpenAPI file.

## Example (direct service usage)
```ts
const service = new NewsRPMService({ apiKey: process.env.NEWSRPM_API_KEY! });
const results = await service.searchArticles({ fullText: "AI", count: 5 });
console.log(results.rows.map(r => r.headline));
```

## Notes and Caveats
- Some server responses use visiblity (typo) in the schema; the client preserves API field names when sending payloads.
- Respect the API rate limits. 429 responses will be retried with exponential backoff by default.

## License
This package is released under the repository's LICENSE.
