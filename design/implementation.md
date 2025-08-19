NewsRPM integration design

- The package will be in pkg/newsrpm
- A NewsRPM service should be created in pkg/newsrpm/NewsRPMService.ts
- The chat command exposed to the user will be called /newsrpm, and should be placed in
  pkg/newsrpm/chatCommands/newsrpm.ts
- Tools should be placed in pkg/newsrpm/tools/{searchIndexedData, searchArticles, getArticleBySlug, getArticleById,
  uploadArticle, listProviders, getBody, renderBody}.ts
- Reference API docs are in:
 - pkg/newsrpm/design/newsrpm_api.txt
 - pkg/newsrpm/design/newsrpm.openapi.json

Basic functionality and workflow

- This package gives an AI agent and the user the ability to search and manage articles in a NewsRPM instance:
 - Search the article index by NewsRPM taxonomy keys (indexedData)
 - Search articles by publisher/provider/type/fullText
 - Retrieve single articles by slug or id
 - Retrieve providers
 - Retrieve article body (native) and rendered body (HTML)
 - Upload (create/update) articles into a NewsRPM instance
- It should expose:
 - A /newsrpm chat command to run quick queries and admin actions from the CLI
 - Tool calls for agents to search, retrieve, and upload articles

Technical details

- NewsRPMService should:
 - Accept config:
  - apiKey: string (required). Used in the Authorization: publicKey ...key... header
  - baseUrl?: string (default: 'https://api.newsrpm.com')
  - requestDefaults?: {
    headers?: Record<string,string>;
    timeoutMs?: number; // default: 30000
    }
  - retry?: { maxRetries?: number; }
 - Provide methods (match OpenAPI, see design/newsrpm.openapi.json):
  - async searchIndexedData(body: {
    key: string;
    value?: string | string[];
    count?: number; offset?: number;
    minDate?: string; maxDate?: string;
    order?: 'date' | 'dateWithQuality';
    }): Promise<MultipleArticleResponse>
  - async searchArticles(body: {
    publisher?: string | string[];
    provider?: string | string[];
    fullText?: string;
    type?: string | string[];
    sponsored?: boolean;
    count?: number; offset?: number;
    minDate?: string; maxDate?: string;
    language?: string;
    }): Promise<MultipleArticleResponse>
  - async getArticleBySlug(slug: string): Promise<SingleArticleResponse>
  - async getArticleById(id: number): Promise<SingleArticleResponse>
  - async listProviders(): Promise<ProviderListResponse>
  - async getBody(bodyId: string): Promise<ArticleBodyResponse>
  - async renderBody(bodyId: string): Promise<ArticleBodyResponse>
  - async uploadArticle(article: Article): Promise<{ success: boolean; id: number }>
 - Handle:
  - Base URL joining and path parameter encoding
  - Authentication per authMode:
   - 'privateHeader' => Authorization: privateKey <apiKey>
  - JSON request/response handling and uniform error normalization
  - Retries on 429/5xx; no retry on 4xx (except optionally 408)
  - Respect timeouts and abort requests when exceeded
- Tools should wrap these methods and be context-aware:
 - searchIndexedData(params) -> returns structured rows as JSON
 - searchArticles(params) -> returns structured rows as JSON
 - getArticleBySlug(slug) -> returns doc
 - getArticleById(id) -> returns doc
 - uploadArticle(article) -> returns { id }
 - listProviders() -> returns providers list
 - getBody(bodyId) / renderBody(bodyId) -> returns body chunks
- Error handling:
 - Standardized error objects: { message, status?: number, code?: string, details?: any, hint?: string }
 - Input validation for required fields (apiKey, key/slug/id/body, minimal article fields)
 - Note: The API schema uses the property name "visiblity" (typo) in many places; mirror field names exactly when
   calling the API.

Chat command: /newsrpm

- Sub-commands:
 - /newsrpm
   index <key> [--value <val|csv>] [--count <n>] [--offset <n>] [--min <iso>] [--max <iso>] [--order date|dateWithQuality]
 - /newsrpm
   search [--publisher <name|csv>] [--provider <name|csv>] [--type <type|csv>] [--fulltext <q>] [--sponsored true|false] [--count <n>] [--offset <n>] [--min <iso>] [--max <iso>] [--language <code>]
 - /newsrpm article slug <slug>
 - /newsrpm article id <id>
 - /newsrpm providers
 - /newsrpm body <bodyId> [--render]
 - /newsrpm upload --json <path>  // load article JSON and upload
- The command should:
 - Parse args, call NewsRPMService, and display summarized results (headline, date, provider, slug)
 - Offer --save <path> to write raw JSON to disk via filesystem service

Implementation in TokenRing Writer app

- Package registration (similar to other packages):
 - Import the package and service in src/tr-writer.ts:
   ```ts
   import * as NewsRPMPackage from "@token-ring/newsrpm";
   import { NewsRPMService } from "@token-ring/newsrpm";
   ```
 - Add the package to the registry alongside others:
   ```ts
   await registry.addPackages(
     // ...existing packages
     NewsRPMPackage,
   );
   ```
 - Extend the WriterConfig to optionally include newsrpm config:
   ```ts
   interface WriterConfig {
     // ...existing
     newsrpm?: {
       apiKey: string;            // required
       authMode?: 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery';
       baseUrl?: string;          // default https://api.newsrpm.com
       defaults?: {
         timeoutMs?: number;
       };
       retry?: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; jitter?: boolean };
     };
   }
   ```
 - Conditionally add the service when apiKey is present (mirrors other services pattern):
   ```ts
   const nrpm = config.newsrpm;
   if (nrpm && nrpm.apiKey) {
     await registry.services.addServices(new NewsRPMService(nrpm));
   } else if (nrpm) {
     console.warn("NewsRPM configuration detected but missing apiKey. Skipping NewsRPMService initialization.");
   }
   ```
 - Enable tools by default, unless user overrides defaults.tools:
   ```ts
   const defaultTools = Object.keys({
     // ...existing tools
     ...NewsRPMPackage.tools,
   });
   ```

Configuration in .tokenring/writer-config.{js,cjs,mjs}

- Minimal example:
  ```js
  export default {
    defaults: {
      persona: 'writer',
      tools: [
        // enable selected tools explicitly or leave undefined to auto-enable
        'searchIndexedData',
        'searchArticles',
        'getArticleBySlug',
        'getArticleById',
        'uploadArticle',
        'listProviders',
        'getBody',
        'renderBody',
      ],
    },
    newsrpm: {
      apiKey: process.env.NEWSRPM_KEY,
      authMode: 'privateHeader',      // or 'privateQuery' to use T= token
      baseUrl: 'https://api.newsrpm.com',
      retry: { maxRetries: 3, baseDelayMs: 500, jitter: true },
    },
  }
  ```
- Environment variable:
 - NEWSRPM_KEY should be set in your shell or .env file used to launch tr-writer

Usage examples

- Search the index for a ticker between dates:
  ```text
  /newsrpm index NormalizedTicker --value GOOG --count 25 --min 2020-07-09T00:00:00.000Z --max 2020-07-10T23:59:59.999Z --order date
  ```
- Search by type (latest 25 press releases):
  ```text
  /newsrpm search --type "Press Release" --count 25 --offset 0
  ```
- Get an article by slug:
  ```text
  /newsrpm article slug example-company-announces-earnings-2025
  ```
- Upload an article from a JSON file:
  ```text
  /newsrpm upload --json ./article.json
  ```

Developer notes

- Refer to API schemas in newsrpm.openapi.json for request/response contracts. Note field name "visiblity" in schema.
- Rate limiting & retries:
 - Implement exponential backoff on 429 and 5xx with jitter
 - Respect any organization usage limits; consider local caching for repeated reads
- Testing:
 - Provide unit tests with mocked HTTP responses for all methods and tools
 - Integration tests gated by NEWSRPM_KEY being present (skip otherwise)
- Security & compliance:
 - Choose appropriate authMode for your deployment (headers preferred server-side)
 - Avoid logging secrets; redact Authorization header and query tokens in logs
