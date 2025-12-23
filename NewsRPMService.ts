import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingService} from "@tokenring-ai/app/types";
import {HttpService} from "@tokenring-ai/utility/http/HttpService";
import {z} from "zod";

export const NewsRPMConfigSchema = z.object({
  apiKey: z.string(),
  authMode: z.enum(['privateHeader', 'publicHeader', 'privateQuery', 'publicQuery']).optional(),
  baseUrl: z.string().optional(),
  requestDefaults: z.object({
    headers: z.record(z.string(), z.string()).optional(),
    timeoutMs: z.number().optional(),
  }).optional(),
  retry: z.object({
    maxRetries: z.number().optional(),
    baseDelayMs: z.number().optional(),
    maxDelayMs: z.number().optional(),
    jitter: z.boolean().optional(),
  }).optional(),
  fetchImpl: z.any().optional(),
});

export type NewsRPMConfig = z.infer<typeof NewsRPMConfigSchema>;

export type MultipleArticleResponse = { success: boolean; rows: any[] };
export type SingleArticleResponse = { success: boolean; doc: any };
export type ProviderListResponse = { success: boolean; rows: Array<{ provider: string }> };
export type ArticleBodyResponse = {
  success: boolean;
  body: { v: number; chunks: Array<{ name: string; format: string; content: string }> }
};

export default class NewsRPMService extends HttpService implements TokenRingService {
  name = "NewsRPMService";
  description = "Service for interacting with a NewsRPM instance";

  private readonly config: NewsRPMConfig;
  private readonly fetchImpl: typeof fetch;
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(config: NewsRPMConfig) {
    super();
    if (!config?.apiKey) throw new Error("NewsRPMService requires apiKey");
    this.config = config;
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.baseUrl = (config.baseUrl ?? 'https://api.newsrpm.com').replace(/\/$/, '');
    this.defaultHeaders = this.buildHeaders();
  }

  async searchIndexedData(body: any): Promise<MultipleArticleResponse> {
    if (!body?.key) throw Object.assign(new Error('key is required'), {status: 400});
    const path = this.buildPath('/search/indexedData');
    return this.fetchJson(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }, 'searchIndexedData');
  }

  async searchArticles(body: any): Promise<MultipleArticleResponse> {
    const path = this.buildPath('/search/article');
    return this.fetchJson(path, {
      method: 'POST',
      body: JSON.stringify(body || {})
    }, 'searchArticles');
  }

  async getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    if (!slug) throw Object.assign(new Error('slug is required'), {status: 400});
    const path = this.buildPath(`/article/${encodeURIComponent(slug)}`);
    return this.fetchJson(path, {method: 'GET'}, 'getArticleBySlug');
  }

  async getArticleById(id: number): Promise<SingleArticleResponse> {
    if (id === undefined || id === null) throw Object.assign(new Error('id is required'), {status: 400});
    const path = this.buildPath(`/article/${encodeURIComponent(String(id))}`);
    return this.fetchJson(path, {method: 'GET'}, 'getArticleById');
  }

  async listProviders(): Promise<ProviderListResponse> {
    const path = this.buildPath('/provider');
    return this.fetchJson(path, {method: 'GET'}, 'listProviders');
  }

  async getBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error('bodyId is required'), {status: 400});
    const path = this.buildPath(`/body/${encodeURIComponent(bodyId)}`);
    return this.fetchJson(path, {method: 'GET'}, 'getBody');
  }

  async renderBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error('bodyId is required'), {status: 400});
    const path = this.buildPath(`/body/${encodeURIComponent(bodyId)}/render`);
    return this.fetchJson(path, {method: 'GET'}, 'renderBody');
  }

  async uploadArticle(article: any): Promise<{ success: boolean; id: number }> {
    if (!article || !article.provider || !article.headline || !article.slug || !article.date || (article.quality === undefined)) {
      throw Object.assign(new Error('Missing required article fields: provider, headline, slug, date, quality'), {status: 400});
    }
    // Note: API schema uses visiblity (typo) — do not rename when sending.
    const path = this.buildPath('/article');
    return this.fetchJson(path, {
      method: 'POST',
      body: JSON.stringify(article)
    }, 'uploadArticle');
  }

  private buildPath(pathname: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(pathname.startsWith('/') ? pathname : '/' + pathname, 'http://dummy.com');

    // auth via query
    const mode = this.config.authMode ?? 'privateHeader';
    if (mode === 'privateQuery') url.searchParams.set('T', this.config.apiKey);
    if (mode === 'publicQuery') url.searchParams.set('P', this.config.apiKey);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === "") continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.pathname + url.search;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.config.requestDefaults?.headers || {}),
      ...(extra || {}),
    };
    // auth via header
    const mode = this.config.authMode ?? 'privateHeader';
    if (mode === 'privateHeader') headers['Authorization'] = `privateKey ${this.config.apiKey}`;
    if (mode === 'publicHeader') headers['Authorization'] = `publicKey ${this.config.apiKey}`;
    return headers;
  }
}
