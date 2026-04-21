import type { TokenRingService } from "@tokenring-ai/app/types";
import { HttpService } from "@tokenring-ai/utility/http/HttpService";
import type z from "zod";
import type {
  ArticleBodyResponse,
  ArticleSearchSchema,
  IndexedDataSearchSchema,
  MultipleArticleResponse,
  ParsedNewsRPMConfig,
  ProviderListResponse,
  SingleArticleResponse,
} from "./schema.ts";

export default class NewsRPMService extends HttpService implements TokenRingService {
  readonly name = "NewsRPMService";
  description = "Service for interacting with a NewsRPM instance";

  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(private config: ParsedNewsRPMConfig) {
    super();
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = this.buildHeaders();
  }

  searchIndexedData(body: z.input<typeof IndexedDataSearchSchema>): Promise<MultipleArticleResponse> {
    if (!body?.key) throw Object.assign(new Error("key is required"), { status: 400 });
    const path = this.buildPath("/search/indexedData");
    return this.fetchJson(
      path,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      "searchIndexedData",
    );
  }

  searchArticles(body: z.input<typeof ArticleSearchSchema>): Promise<MultipleArticleResponse> {
    const path = this.buildPath("/search/article");
    return this.fetchJson(
      path,
      {
        method: "POST",
        body: JSON.stringify(body || {}),
      },
      "searchArticles",
    );
  }

  getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    if (!slug) throw Object.assign(new Error("slug is required"), { status: 400 });
    const path = this.buildPath(`/article/${encodeURIComponent(slug)}`);
    return this.fetchJson(path, { method: "GET" }, "getArticleBySlug");
  }

  getArticleById(id: number): Promise<SingleArticleResponse> {
    if (id === undefined || id === null) throw Object.assign(new Error("id is required"), { status: 400 });
    const path = this.buildPath(`/article/${encodeURIComponent(String(id))}`);
    return this.fetchJson(path, { method: "GET" }, "getArticleById");
  }

  listProviders(): Promise<ProviderListResponse> {
    const path = this.buildPath("/provider");
    return this.fetchJson(path, { method: "GET" }, "listProviders");
  }

  getBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error("bodyId is required"), { status: 400 });
    const path = this.buildPath(`/body/${encodeURIComponent(bodyId)}`);
    return this.fetchJson(path, { method: "GET" }, "getBody");
  }

  renderBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error("bodyId is required"), { status: 400 });
    const path = this.buildPath(`/body/${encodeURIComponent(bodyId)}/render`);
    return this.fetchJson(path, { method: "GET" }, "renderBody");
  }

  uploadArticle(article: any): Promise<{ success: boolean; id: number }> {
    if (!article?.provider || !article.headline || !article.slug || !article.date || article.quality === undefined) {
      throw Object.assign(new Error("Missing required article fields: provider, headline, slug, date, quality"), { status: 400 });
    }
    // Note: API schema uses visiblity (typo) — do not rename when sending.
    const path = this.buildPath("/article");
    return this.fetchJson(
      path,
      {
        method: "POST",
        body: JSON.stringify(article),
      },
      "uploadArticle",
    );
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

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      "Content-Type": "application/json",
      ...this.config.requestDefaults?.headers,
      ...extra,
      Authorization: `privateKey ${this.config.apiKey}`,
    };
  }
}
