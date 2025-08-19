import {type Registry, Service} from "@token-ring/registry";

export type NewsRPMAuthMode = 'privateHeader' | 'publicHeader' | 'privateQuery' | 'publicQuery';

export type NewsRPMRetry = { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; jitter?: boolean };

export type NewsRPMRequestDefaults = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type NewsRPMConfig = {
  apiKey: string;
  authMode?: NewsRPMAuthMode;
  baseUrl?: string;
  requestDefaults?: NewsRPMRequestDefaults;
  retry?: NewsRPMRetry;
  fetchImpl?: typeof fetch; // for tests
};

export type MultipleArticleResponse = { success: boolean; rows: any[] };
export type SingleArticleResponse = { success: boolean; doc: any };
export type ProviderListResponse = { success: boolean; rows: Array<{ provider: string }> };
export type ArticleBodyResponse = {
  success: boolean;
  body: { v: number; chunks: Array<{ name: string; format: string; content: string }> }
};

export default class NewsRPMService extends Service {
  name = "NewsRPM";
  description = "Service for interacting with a NewsRPM instance";

  private registry!: Registry;
  private readonly config: NewsRPMConfig;
  private readonly fetchImpl: typeof fetch;

  constructor(config: NewsRPMConfig) {
    super();
    if (!config?.apiKey) throw new Error("NewsRPMService requires apiKey");
    this.config = config;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async start(registry: Registry): Promise<void> {
    this.registry = registry;
  }

  async stop(_registry: Registry): Promise<void> {
  }

  async searchIndexedData(body: any): Promise<MultipleArticleResponse> {
    if (!body?.key) throw Object.assign(new Error('key is required'), {status: 400});
    const url = this.buildUrl('/search/indexedData');
    const res = await this.doFetchWithRetry(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body)
    });
    return await this.parseJson(res, 'searchIndexedData');
  }

  async searchArticles(body: any): Promise<MultipleArticleResponse> {
    const url = this.buildUrl('/search/article');
    const res = await this.doFetchWithRetry(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body || {})
    });
    return await this.parseJson(res, 'searchArticles');
  }

  async getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    if (!slug) throw Object.assign(new Error('slug is required'), {status: 400});
    const url = this.buildUrl(`/article/${encodeURIComponent(slug)}`);
    const res = await this.doFetchWithRetry(url, {method: 'GET', headers: this.buildHeaders()});
    return await this.parseJson(res, 'getArticleBySlug');
  }

  async getArticleById(id: number): Promise<SingleArticleResponse> {
    if (id === undefined || id === null) throw Object.assign(new Error('id is required'), {status: 400});
    const url = this.buildUrl(`/article/${encodeURIComponent(String(id))}`);
    const res = await this.doFetchWithRetry(url, {method: 'GET', headers: this.buildHeaders()});
    return await this.parseJson(res, 'getArticleById');
  }

  async listProviders(): Promise<ProviderListResponse> {
    const url = this.buildUrl('/provider');
    const res = await this.doFetchWithRetry(url, {method: 'GET', headers: this.buildHeaders()});
    return await this.parseJson(res, 'listProviders');
  }

  async getBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error('bodyId is required'), {status: 400});
    const url = this.buildUrl(`/body/${encodeURIComponent(bodyId)}`);
    const res = await this.doFetchWithRetry(url, {method: 'GET', headers: this.buildHeaders()});
    return await this.parseJson(res, 'getBody');
  }

  async renderBody(bodyId: string): Promise<ArticleBodyResponse> {
    if (!bodyId) throw Object.assign(new Error('bodyId is required'), {status: 400});
    const url = this.buildUrl(`/body/${encodeURIComponent(bodyId)}/render`);
    const res = await this.doFetchWithRetry(url, {method: 'GET', headers: this.buildHeaders()});
    return await this.parseJson(res, 'renderBody');
  }

  async uploadArticle(article: any): Promise<{ success: boolean; id: number }> {
    if (!article || !article.provider || !article.headline || !article.slug || !article.date || (article.quality === undefined)) {
      throw Object.assign(new Error('Missing required article fields: provider, headline, slug, date, quality'), {status: 400});
    }
    // Note: API schema uses visiblity (typo) — do not rename when sending.
    const url = this.buildUrl('/article');
    const res = await this.doFetchWithRetry(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(article)
    });
    return await this.parseJson(res, 'uploadArticle');
  }

  private buildUrl(pathname: string, query?: Record<string, string | number | boolean | undefined>): string {
    const base = (this.config.baseUrl ?? 'https://api.newsrpm.com').replace(/\/$/, '');
    const url = new URL(base + (pathname.startsWith('/') ? pathname : '/' + pathname));

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
    return url.toString();
  }

  private buildHeaders(extra?: Record<string, string>): HeadersInit {
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

  private async doFetchWithRetry(input: RequestInfo | URL, init: RequestInit & {
    timeoutMs?: number
  } = {}): Promise<Response> {
    const {retry} = this.config;
    const maxRetries = retry?.maxRetries ?? 3;
    const baseDelay = retry?.baseDelayMs ?? 500;
    const maxDelay = retry?.maxDelayMs ?? 4000;
    const jitter = retry?.jitter ?? true;

    let attempt = 0;
    let delay = baseDelay;

    while (true) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? this.config.requestDefaults?.timeoutMs ?? 30000);
      try {
        const res = await this.fetchImpl(input, {...init, signal: controller.signal});
        clearTimeout(timeout);
        if (res.ok) return res;
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          if (attempt >= maxRetries) return res;
          const sleep = jitter ? delay + Math.floor(Math.random() * Math.min(250, delay)) : delay;
          await new Promise((r) => setTimeout(r, sleep));
          delay = Math.min(maxDelay, delay * 2);
          attempt++;
          continue;
        }
        return res;
      } catch (e: any) {
        clearTimeout(timeout);
        if (e?.name === 'AbortError') {
          if (attempt >= maxRetries) throw Object.assign(new Error('Request timeout'), {status: 408});
          await new Promise((r) => setTimeout(r, delay));
          delay = Math.min(maxDelay, delay * 2);
          attempt++;
          continue;
        }
        throw e;
      }
    }
  }

  private async parseJson(res: Response, context: string): Promise<any> {
    const text = await res.text().catch(() => "");
    let json: any = undefined;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
    }
    if (!res.ok) {
      const err: any = new Error(`${context} failed (${res.status})`);
      err.status = res.status;
      err.details = json ?? text?.slice(0, 500);
      err.hint = res.status === 401 ? 'Check NEWSRPM apiKey/authMode' : res.status === 429 ? 'Slow down requests' : undefined;
      throw err;
    }
    return json ?? {};
  }
}
