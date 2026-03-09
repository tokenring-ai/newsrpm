# @tokenring-ai/newsrpm

NewsRPM integration package for the TokenRing ecosystem, providing comprehensive news article management, search, and retrieval capabilities.

## Overview

NewsRPM is a powerful API for storing, indexing, and retrieving news articles and related metadata. This package wraps common API calls and exposes them as:

- **NewsRPMService**: A TokenRingService for direct API interactions
- **8 Tools**: Ready-to-use tools for the TokenRing tools registry
- **`/newsrpm` Chat Command**: Interactive CLI command for quick access
- **4 Scripting Functions**: Global functions available when scripting service is enabled

## Key Features

- **Comprehensive Search**: Search indexed data by taxonomy keys (e.g., ticker, topic, region) and articles by publisher, provider, type, full-text, and more
- **Article Retrieval**: Retrieve articles by slug or numeric ID with full metadata
- **Content Management**: Fetch article bodies in native format or rendered HTML
- **Provider Management**: List and manage available news providers
- **Article Upload**: Create and update articles in NewsRPM instances
- **Flexible Authentication**: Multiple authentication modes (header/query-based)
- **Robust Error Handling**: Built-in retry logic, timeout handling, and comprehensive error responses
- **Plugin Integration**: Seamless integration with TokenRing's plugin architecture
- **Scripting Functions**: 4 global functions available when scripting service is enabled
- **Chat Command**: Interactive CLI command for quick access to all features

## Installation

This package is part of the TokenRing monorepo. When used within TokenRing applications, it can be enabled in the registry like other TokenRing packages.

### Package Registration

```typescript
import NewsRPMPackage from "@tokenring-ai/newsrpm";
import { NewsRPMService } from "@tokenring-ai/newsrpm";
import { TokenRingApp } from "@tokenring-ai/app";

// In your application setup
const app = new TokenRingApp();
await app.start();

// Package automatically registers with TokenRing plugin system
// Register services based on your configuration
```

## Configuration

The NewsRPMService accepts the following configuration schema (validated using Zod):

### Configuration Schema

```typescript
import { NewsRPMConfigSchema } from "@tokenring-ai/newsrpm";

// Schema definition:
{
  apiKey: string;                    // Required: API key for your NewsRPM instance
  authMode?: 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery';
  baseUrl?: string;                  // Default: 'https://api.newsrpm.com'
  requestDefaults?: {
    headers?: Record<string, string>;
    timeoutMs?: number;
  };
  retry?: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
  };
}
```

### Configuration Example

```typescript
// In your application configuration
const config = {
  newsrpm: {
    apiKey: process.env.NEWSRPM_API_KEY!,
    authMode: 'privateHeader',
    baseUrl: 'https://api.newsrpm.com',
    requestDefaults: {
      timeoutMs: 20000,
      headers: {
        'User-Agent': 'TokenRing-NewsRPM/1.0'
      }
    },
    retry: {
      maxRetries: 5,
      baseDelayMs: 400,
      maxDelayMs: 4000,
      jitter: true
    }
  }
};
```

### Environment Variables

- `NEWSRPM_API_KEY`: Set this environment variable to your NewsRPM API key
- `NEWSRPM_BASE_URL`: Optional, defaults to 'https://api.newsrpm.com'

## Core Components

### NewsRPMService

The core service class that handles all API interactions. Implements the `TokenRingService` interface.

```typescript
import NewsRPMService from "@tokenring-ai/newsrpm";

const service = new NewsRPMService({
  apiKey: "your-api-key",
  authMode: 'privateHeader'
});

// Search articles
const results = await service.searchArticles({
  fullText: "artificial intelligence",
  count: 10
});

// Get article by slug
const article = await service.getArticleBySlug("example-article-slug");

// Upload new article
const uploadResult = await service.uploadArticle({
  provider: "Reuters",
  headline: "Breaking News",
  slug: "breaking-news-2025",
  date: new Date().toISOString(),
  quality: 0.9
});
```

#### Service Methods

##### Search Methods

**`searchIndexedData(body: any): Promise<MultipleArticleResponse>`**

Search indexed data by taxonomy key/value pairs.

```typescript
const result = await service.searchIndexedData({
  key: "NormalizedTicker",
  value: "AAPL",
  count: 25,
  minDate: "2024-01-01T00:00:00.000Z"
});
```

**Parameters:**
- `key` (required): Index key specifier (e.g., NormalizedTicker, topic, region)
- `value` (optional): Value to look up in the index (string or array of strings)
- `count` (optional): Number of articles to return
- `offset` (optional): How many articles to skip before returning results
- `minDate` (optional): Earliest date to return (inclusive, ISO 8601)
- `maxDate` (optional): Latest date to return (inclusive, ISO 8601)
- `order` (optional): Sort order: "date" or "dateWithQuality"

**`searchArticles(body: any): Promise<MultipleArticleResponse>`**

Search articles with various filters.

```typescript
const result = await service.searchArticles({
  publisher: ["Reuters", "BBC"],
  type: "Press Release",
  sponsored: false,
  count: 50
});
```

**Parameters:**
- `publisher` (optional): Name(s) of the publisher to search for
- `provider` (optional): Name(s) of the provider to search for
- `fullText` (optional): Full text query to execute against the article headline
- `type` (optional): Type(s) of article to search for
- `sponsored` (optional): Restrict to sponsored or non-sponsored content
- `count` (optional): Number of articles to return
- `offset` (optional): How many articles to skip before returning results
- `minDate` (optional): Earliest date to return (inclusive, ISO 8601)
- `maxDate` (optional): Latest date to return (inclusive, ISO 8601)
- `language` (optional): Filter by article language

##### Article Retrieval Methods

**`getArticleBySlug(slug: string): Promise<SingleArticleResponse>`**

Retrieve article by URL slug.

```typescript
const article = await service.getArticleBySlug("tech-earnings-report-2025");
```

**Parameters:**
- `slug` (required): The unique slug identifier of the article to retrieve

**`getArticleById(id: number): Promise<SingleArticleResponse>`**

Retrieve article by numeric ID.

```typescript
const article = await service.getArticleById(12345);
```

**Parameters:**
- `id` (required): The local numeric identifier of the article to retrieve

##### Content Management Methods

**`listProviders(): Promise<ProviderListResponse>`**

Get available news providers.

```typescript
const providers = await service.listProviders();
```

**`getBody(bodyId: string): Promise<ArticleBodyResponse>`**

Get article body in native format.

```typescript
const body = await service.getBody("body-abc123");
```

**Parameters:**
- `bodyId` (required): Body ID of the article body to retrieve

**`renderBody(bodyId: string): Promise<ArticleBodyResponse>`**

Get article body rendered as HTML.

```typescript
const rendered = await service.renderBody("body-abc123");
```

**Parameters:**
- `bodyId` (required): Body ID of the article body to retrieve (rendered)

##### Article Upload Method

**`uploadArticle(article: any): Promise<{ success: boolean; id: number }>`**

Create or update articles.

```typescript
const result = await service.uploadArticle({
  provider: "Tech News",
  headline: "Latest Technology Updates",
  slug: "tech-updates-2025",
  date: new Date().toISOString(),
  quality: 0.95,
  visibility: "published"
});
```

**Required Parameters:**
- `provider`: News provider name
- `headline`: Article headline
- `slug`: URL slug
- `date`: ISO date string
- `quality`: Quality score

**Optional Parameters:**
- `publisher`: The actual publisher of the article
- `link`: URL of the article
- `expires`: Expiration date for the article
- `summary`: Summary of the article (HTML)
- `firstParagraph`: First paragraph of the article (HTML)
- `bodyId`: Unique identifier for article body
- `language`: Language of the article
- `visiblity`: Article visibility ("draft", "embargo", "published", "retracted")
- `metaData`: Provider-specific metadata
- `normalizedData`: Normalized metadata

**Note:** The API schema uses "visiblity" (typo) — field names are preserved exactly as defined.

## Services

### NewsRPMService

The NewsRPMService implements the `TokenRingService` interface and provides:

- **Name**: "NewsRPMService"
- **Description**: "Service for interacting with a NewsRPM instance"
- **Methods**: 8 API methods for article management

#### Service Registration

```typescript
import { TokenRingApp } from "@tokenring-ai/app";
import NewsRPMService from "@tokenring-ai/newsrpm";

const app = new TokenRingApp();

// Register the service
app.addServices(new NewsRPMService({
  apiKey: process.env.NEWSRPM_API_KEY!
}));

// Access the service from an agent
const service = agent.requireServiceByType(NewsRPMService);
const articles = await service.searchArticles({ fullText: "AI" });
```

## Tools Integration

The package provides 8 tools for agent integration, automatically registered with the TokenRing chat service.

### Available Tools

| Tool Name | Display Name | Description |
|-----------|--------------|-------------|
| `newsrpm_searchIndexedData` | Newsrpm/searchIndexedData | Search by taxonomy keys |
| `newsrpm_searchArticles` | Newsrpm/searchArticles | Search articles with filters |
| `newsrpm_getArticleBySlug` | Newsrpm/getArticleBySlug | Get article by slug |
| `newsrpm_getArticleById` | Newsrpm/getArticleById | Get article by ID |
| `newsrpm_uploadArticle` | Newsrpm/uploadArticle | Upload new or update existing article |
| `newsrpm_listProviders` | Newsrpm/listProviders | List available news providers |
| `newsrpm_getBody` | Newsrpm/getBody | Get article body in native format |
| `newsrpm_renderBody` | Newsrpm/renderBody | Render article body as HTML |

### Tool Usage Examples

#### newsrpm_searchIndexedData

```typescript
{
  key: "topic",
  value: "artificial intelligence",
  count: 10
}
```

#### newsrpm_searchArticles

```typescript
{
  publisher: "Reuters",
  fullText: "AI technology",
  count: 25
}
```

#### newsrpm_getArticleBySlug

```typescript
{
  slug: "example-article-slug"
}
```

#### newsrpm_getArticleById

```typescript
{
  id: 12345
}
```

#### newsrpm_uploadArticle

```typescript
{
  article: {
    provider: "News Source",
    headline: "Article Title",
    slug: "article-slug",
    date: "2025-01-01T00:00:00.000Z",
    quality: 0.9,
    visibility: "published"
  }
}
```

#### newsrpm_listProviders

```typescript
{}
```

#### newsrpm_getBody

```typescript
{
  bodyId: "body-abc123"
}
```

#### newsrpm_renderBody

```typescript
{
  bodyId: "body-abc123"
}
```

### Tool Usage in Agents

```typescript
// In an agent context
const results = await agent.callTool("newsrpm_searchArticles", {
  fullText: "artificial intelligence",
  publisher: "TechCrunch",
  count: 20
});
```

## Chat Commands

The package provides a comprehensive `/newsrpm` command for interactive use in the TokenRing REPL.

### Command Syntax

```
/newsrpm [subcommand] [options]
```

### Available Subcommands

#### Search Indexed Data

```bash
/newsrpm index <key> [options]
```

**Options:**
- `--value <values>`: Filter by value(s), comma-separated for multiple
- `--count <n>`: Limit number of results
- `--offset <n>`: Skip number of results
- `--min <iso>`: Minimum date (ISO format)
- `--max <iso>`: Maximum date (ISO format)
- `--order <order>`: Sort order (date or dateWithQuality)
- `--save <path>`: Save response to JSON file

**Example:**
```bash
/newsrpm index publisher --value "Reuters,BBC" --count 20
```

#### Search Articles

```bash
/newsrpm search [options]
```

**Options:**
- `--publisher <names>`: Filter by publisher(s), comma-separated
- `--provider <names>`: Filter by provider(s), comma-separated
- `--type <types>`: Filter by type(s), comma-separated
- `--fulltext <query>`: Full-text search query
- `--sponsored <true|false>`: Filter by sponsored status
- `--language <lang>`: Filter by language
- `--count <n>`: Limit number of results
- `--offset <n>`: Skip number of results
- `--min <iso>`: Minimum date (ISO format)
- `--max <iso>`: Maximum date (ISO format)
- `--save <path>`: Save response to JSON file

**Example:**
```bash
/newsrpm search --fulltext "AI" --count 10 --publisher "Reuters"
```

#### Get Article

```bash
# By slug
/newsrpm article slug <slug>
# By ID
/newsrpm article id <id>
```

**Examples:**
```bash
/newsrpm article slug "my-article-slug"
/newsrpm article id 12345
```

#### List Providers

```bash
/newsrpm providers [options]
```

**Options:**
- `--save <path>`: Save response to JSON file

**Example:**
```bash
/newsrpm providers --save providers.json
```

#### Get Article Body

```bash
/newsrpm body <bodyId> [options]
```

**Options:**
- `--render`: Render the body content
- `--save <path>`: Save response to JSON file

**Example:**
```bash
/newsrpm body abc123 --render
```

#### Upload Article

```bash
/newsrpm upload --json <path>
```

**Options:**
- `--json <path>`: Path to JSON file containing article data

**Example:**
```bash
/newsrpm upload --json article.json
```

## Scripting Functions

When `@tokenring-ai/scripting` is available, the package registers 4 global functions:

### Available Functions

1. **`searchArticles(query: string): string`**
   - Search articles using full-text query
   - Returns: JSON string of article rows

   ```javascript
   const articles = searchArticles("artificial intelligence");
   ```

2. **`searchIndexedData(key: string, value: string): string`**
   - Search indexed data by taxonomy keys
   - Returns: JSON string of article rows

   ```javascript
   const results = searchIndexedData("NormalizedTicker", "AAPL");
   ```

3. **`getArticleBySlug(slug: string): string`**
   - Retrieve article by slug
   - Returns: JSON string of article document

   ```javascript
   const article = getArticleBySlug("my-article-slug");
   ```

4. **`listProviders(): string`**
   - List available news providers
   - Returns: JSON string of provider list

   ```javascript
   const providers = listProviders();
   ```

### Scripting Examples

```javascript
// Search and analyze articles
const articles = searchArticles("climate change");
const analysis = llm("Summarize these articles: " + articles);

// Get ticker-specific news
const news = searchIndexedData("NormalizedTicker", "TSLA");
const summary = llm("Analyze sentiment: " + news);
```

## Authentication

The package supports 4 authentication modes:

| Mode | Method | Description |
|------|--------|-------------|
| `privateHeader` (default) | `Authorization: privateKey <apiKey>` | Server-side authentication via header |
| `publicHeader` | `Authorization: publicKey <apiKey>` | Browser/CORS authentication via header |
| `privateQuery` | Query parameter `T=<apiKey>` | Server-side via query (not recommended for web) |
| `publicQuery` | Query parameter `P=<apiKey>` | Browser/CORS via query parameter |

Choose the mode that matches your NewsRPM deployment security requirements.

## Response Types

### MultipleArticleResponse

```typescript
{
  success: boolean;
  rows: Array<{
    headline?: string;
    provider?: string;
    publisher?: string;
    slug?: string;
    link?: string;
    date?: string;
    expires?: string;
    summary?: string;
    firstParagraph?: string;
    bodyId?: string;
    language?: string;
    visiblity?: "draft" | "embargo" | "published" | "retracted";
    quality?: number;
    metaData?: object;
    normalizedData?: object;
  }>;
}
```

### SingleArticleResponse

```typescript
{
  success: boolean;
  doc: {
    // Full article object matching MultipleArticleResponse rows
  };
}
```

### ProviderListResponse

```typescript
{
  success: boolean;
  rows: Array<{
    provider: string;
  }>;
}
```

### ArticleBodyResponse

```typescript
{
  success: boolean;
  body: {
    v: number;
    chunks: Array<{
      name: string;
      format: string;  // MIME type (e.g., "text/html")
      content: string;
    }>;
  };
}
```

## Error Handling

The service implements comprehensive error handling:

- **Input Validation**: Required fields are validated before API calls
- **HTTP Error Handling**: Non-2xx responses include status, message, and hints
- **Retry Logic**: 429 and 5xx responses retry with exponential backoff
- **Timeout Handling**: Requests timeout according to configured timeoutMs

### Error Response Format

```typescript
{
  message: string;
  status?: number;
  code?: string;
  details?: any;
  hint?: string;
}
```

### Error Handling Example

```typescript
try {
  const result = await service.searchArticles({ fullText: "test" });
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  if (error.status === 400) {
    console.error("Invalid request parameters");
  } else if (error.status === 401) {
    console.error("Invalid API key");
  } else if (error.status === 429) {
    console.error("Rate limit exceeded");
  }
}
```

## API Reference

### OpenAPI Schema

The complete API schema is available in:
- `pkg/newsrpm/design/newsrpm.openapi.json` - OpenAPI specification
- `pkg/newsrpm/design/newsrpm_api.txt` - Text summary

### Upload Article Schema

For upload operations, the article object must include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | Yes | News provider name |
| `headline` | string | Yes | Article headline |
| `slug` | string | Yes | URL slug |
| `date` | string (ISO) | Yes | Article timestamp |
| `visibility` | string | Yes | "draft", "embargo", "published", or "retracted" |
| `quality` | number | Yes | Quality score |

Additional optional fields:
- `publisher`: The actual publisher of the article
- `link`: URL of the article
- `expires`: Expiration date
- `summary`: Summary in HTML format
- `firstParagraph`: First paragraph in HTML format
- `bodyId`: Unique identifier for article body
- `language`: Article language
- `visiblity`: Article visibility (note: typo preserved from API)
- `metaData`: Provider-specific metadata object
- `normalizedData`: Normalized metadata object

## Package Structure

```
pkg/newsrpm/
├── index.ts                          # Main exports (NewsRPMService)
├── NewsRPMService.ts                 # Core service class
├── plugin.ts                         # Plugin registration
├── tools.ts                          # Tool exports
├── commands.ts                       # Command exports
├── schema.ts                         # Configuration schema
├── commands/
│   ├── newsrpm.ts                    # /newsrpm command index
│   └── newsrpm/
│       ├── index.ts                  # /newsrpm index
│       ├── search.ts                 # /newsrpm search
│       ├── article.ts                # /newsrpm article
│       ├── providers.ts              # /newsrpm providers
│       ├── body.ts                   # /newsrpm body
│       ├── upload.ts                 # /newsrpm upload
│       └── _utils.ts                 # shared parseFlags/saveIfRequested
├── tools/
│   ├── searchIndexedData.ts
│   ├── searchArticles.ts
│   ├── getArticleBySlug.ts
│   ├── getArticleById.ts
│   ├── uploadArticle.ts
│   ├── listProviders.ts
│   ├── getBody.ts
│   └── renderBody.ts
├── design/
│   ├── newsrpm.openapi.json         # OpenAPI specification
│   ├── newsrpm_api.txt              # Text summary
│   └── implementation.md            # Implementation notes
├── package.json                     # Package metadata
├── vitest.config.ts                 # Test configuration
└── README.md                        # This file
```

## Configuration Integration

The package integrates with TokenRing's configuration system:

```typescript
// In your application
const config = app.getConfigSlice('newsrpm', NewsRPMConfigSchema);
if (config) {
  app.addServices(new NewsRPMService(config));
}
```

## Dependencies

The package depends on:

- `@tokenring-ai/app`: Application framework for plugin integration
- `@tokenring-ai/chat`: Chat functionality for tools registration
- `@tokenring-ai/agent`: Agent framework
- `@tokenring-ai/utility`: Utility functions including HttpService
- `@tokenring-ai/scripting`: Scripting service for global functions
- `@tokenring-ai/filesystem`: File system service for command file operations
- `zod`: Runtime type validation

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun run test
bun run test:watch
bun run test:coverage
```

### Development Commands

```bash
bun run dev          # Watch mode compilation
bun run clean        # Clean build directory
```

## Integration Examples

### Basic Integration

```typescript
import { NewsRPMService } from "@tokenring-ai/newsrpm";

const service = new NewsRPMService({
  apiKey: process.env.NEWSRPM_API_KEY!,
  authMode: 'privateHeader'
});

// Search for technology articles
const techNews = await service.searchArticles({
  type: "Technology",
  count: 10
});
```

### Advanced Integration with Agents

```typescript
// Tools are automatically available to agents
const agent = new Agent();
const articles = await agent.callTool("newsrpm_searchArticles", {
  fullText: "artificial intelligence",
  publisher: "TechCrunch",
  count: 20
});
```

### File System Integration

```typescript
// Upload article from JSON file
const fsService = agent.requireServiceByType(FileSystemService);
const raw = await fsService.readFile('article.json', 'utf-8');
const article = JSON.parse(raw);
const result = await service.uploadArticle(article);
```

### Using Chat Command

```typescript
// When the app is running, access NewsRPM via:
/newsrpm search --fulltext "AI" --count 10
/newsrpm index NormalizedTicker --value GOOG --count 25
/newsrpm upload --json article.json
```

## Best Practices

1. **API Key Security**: Store API keys in environment variables, never in code
2. **Rate Limiting**: Respect NewsRPM rate limits; use retry configuration
3. **Error Handling**: Always wrap API calls in try-catch blocks
4. **Response Caching**: Consider caching frequently accessed articles
5. **Batch Operations**: Use appropriate count/offset parameters for large datasets
6. **Date Filtering**: Use ISO 8601 format for date parameters
7. **Provider Management**: Regularly check available providers

## Notes and Limitations

- Some server responses use "visiblity" (typo) in the schema; field names are preserved exactly
- Rate limiting: 429 responses are automatically retried with exponential backoff
- Timeout: Default timeout is 30 seconds; adjust based on your needs
- Authentication: Choose appropriate authMode for your deployment (headers preferred for server-side)
- The article upload schema requires specific fields including provider, headline, slug, date, visibility, and quality
- The package exports the service through the plugin system; tools and commands are auto-registered

## License

MIT License - see [LICENSE](./LICENSE) file for details.
