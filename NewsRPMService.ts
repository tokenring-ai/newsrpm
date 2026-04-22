import type { TokenRingService } from "@tokenring-ai/app/types";
import { HTTPRetriever } from "@tokenring-ai/utility/http/HTTPRetriever";
import { z } from "zod";
import {
  ArticleSearchSchema,
  ArticleBodyResponseSchema,
  IndexedDataSearchSchema,
  MultipleArticleResponseSchema,
  ProviderListResponseSchema,
  SingleArticleResponseSchema,
} from "./schema.ts";
import type { ArticleBodyResponse, MultipleArticleResponse, ParsedNewsRPMConfig, ProviderListResponse, SingleArticleResponse } from "./schema.ts";

const UploadArticleResponseSchema = z
  .object({
    success: z.boolean(),
    id: z.number(),
  })
  .passthrough();

export default class NewsRPMService implements TokenRingService {
  readonly name = "NewsRPMService";
  description = "Service for interacting with a NewsRPM instance";

  private readonly retriever: HTTPRetriever;

  constructor(private config: ParsedNewsRPMConfig) {
    this.retriever = new HTTPRetriever({
      baseUrl: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...config.requestDefaults?.headers,
        Authorization: `privateKey ${config.apiKey}`,
      },
      timeout: 10_000,
    });
  }

  searchIndexedData(body: z.input<typeof IndexedDataSearchSchema>): Promise<MultipleArticleResponse> {
    if (!body?.key) throw Object.assign(new Error("key is required"), { status: 400 });
    return this.retriever.fetchValidatedJson({
      url: this.buildPath("/search/indexedData"),
      opts: {
        method: "POST",
        body: JSON.stringify(body),
      },
      schema: MultipleArticleResponseSchema,
      context: "searchIndexedData",
    });
  }

  searchArticles(body: z.input<typeof ArticleSearchSchema>): Promise<MultipleArticleResponse> {
    return this.retriever.fetchValidatedJson({
      url: this.buildPath("/search/article"),
      opts: {
        method: "POST",
        body: JSON.stringify(body || {}),
      },
      schema: MultipleArticleResponseSchema,
      context: "searchArticles",
    });
  }

  getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    if (!slug) throw Object.assign(new Error("slug is required"), { status: 400 });
    return this.retriever.fetchValidatedJson({
      url: this.buildPath(`/article/${encodeURIComponent(slug)}`),
      opts: { method: "GET" },
      schema: SingleArticleResponseSchema,
      context: "getArticleBySlug",
    });
  }

  getArticleById(id: number): Promise<SingleArticleResponse> {
    if (id === undefined || id === null) throw Object.assign(new Error("id is required"), { status: 400 });
    return this.retriever.fetchValidatedJson({
      url: this.buildPath(`/article/${encodeURIComponent(String(id))}`),
      opts: { method: "GET" },
      schema: SingleArticleResponseSchema,
      context: "getArticleById",
    });
  }

  listProviders(): Promise<ProviderListResponse> {
    return this.retriever.fetchValidatedJson({
      url: this.buildPath("/provider"),
      opts: { method: "GET" },
      schema: ProviderListResponseSchema,
      context: "listProviders",
    });
  }

  getBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error("bodyId is required"), { status: 400 });
    return this.retriever.fetchValidatedJson({
      url: this.buildPath(`/body/${encodeURIComponent(bodyId)}`),
      opts: { method: "GET" },
      schema: ArticleBodyResponseSchema,
      context: "getBody",
    });
  }

  renderBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error("bodyId is required"), { status: 400 });
    return this.retriever.fetchValidatedJson({
      url: this.buildPath(`/body/${encodeURIComponent(bodyId)}/render`),
      opts: { method: "GET" },
      schema: ArticleBodyResponseSchema,
      context: "renderBody",
    });
  }

  uploadArticle(article: any): Promise<{ success: boolean; id: number }> {
    if (!article?.provider || !article.headline || !article.slug || !article.date || article.quality === undefined) {
      throw Object.assign(new Error("Missing required article fields: provider, headline, slug, date, quality"), { status: 400 });
    }
    // Note: API schema uses visiblity (typo) — do not rename when sending.
    return this.retriever.fetchValidatedJson({
      url: this.buildPath("/article"),
      opts: {
        method: "POST",
        body: JSON.stringify(article),
      },
      schema: UploadArticleResponseSchema,
      context: "uploadArticle",
    });
  }

  private buildPath(pathname: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(pathname.startsWith("/") ? pathname : "/" + pathname, "http://dummy.com");

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === "") continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.pathname + url.search;
  }
}
