import {z} from "zod";
import NewsRPMArticleBodySchema from "./schemas/newsrpm/v1/article.body.ts";
import NewsRPMArticleSchema from "./schemas/newsrpm/v1/article.ts";

export const NewsRPMConfigSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().default("https://api.newsrpm.com"),
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
});
export type ParsedNewsRPMConfig = z.output<typeof NewsRPMConfigSchema>;

export const IndexedDataSearchSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  count: z.number().optional(),
  offset: z.number().optional(),
  minDate: z.number().optional().describe("Unix timestamp in milliseconds"),
  maxDate: z.number().optional().describe("Unix timestamp in milliseconds"),
  order: z.enum(['date', 'dateWithQuality']).optional()
});

export type IndexedDataSearch = z.input<typeof IndexedDataSearchSchema>;

export const ArticleSearchSchema = z.object({
  publisher: z.union([z.string(), z.array(z.string())]).optional(),
  provider: z.union([z.string(), z.array(z.string())]).optional(),
  providerCode: z.union([z.string(), z.array(z.string())]).optional(),
  fullText: z.string().optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  sponsored: z.union([z.boolean(), z.number()]).optional(),
  count: z.coerce.number().int().min(1, "Invalid count: parameter").max(100, "Invalid count: parameter").default(25),
  offset: z.coerce.number().int().min(0, "Invalid offset: parameter").max(1000, "Invalid offset: parameter").default(0),
  minDate: z.coerce.date().refine((v) => !isNaN(v.getTime()), {message: "Invalid minDate= parameter"}).optional(),
  maxDate: z.coerce.date().refine((v) => !isNaN(v.getTime()), {message: "Invalid maxDate= parameter"}).optional(),
  language: z.union([z.string(), z.array(z.string())]).optional(),
});

export type ArticleSearch = z.input<typeof ArticleSearchSchema>;

export const MultipleArticleResponseSchema = z.object({
  success: z.boolean(),
  rows: z.array(NewsRPMArticleSchema),
});

export const SingleArticleResponseSchema = z.object({
  success: z.boolean(),
  doc: NewsRPMArticleSchema,
});

export const ProviderListResponseSchema = z.object({
  success: z.boolean(),
  rows: z.array(z.object({provider: z.string()})),
})

export const ArticleBodyResponseSchema = z.object({
  success: z.boolean(),
  body: NewsRPMArticleBodySchema,
})

export type MultipleArticleResponse = z.infer<typeof MultipleArticleResponseSchema>;
export type SingleArticleResponse = z.infer<typeof SingleArticleResponseSchema>;
export type ProviderListResponse = z.infer<typeof ProviderListResponseSchema>;
export type ArticleBodyResponse = z.infer<typeof ArticleBodyResponseSchema>;