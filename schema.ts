import { z } from "zod";
import NewsRPMArticleBodySchema from "./schemas/newsrpm/v1/article.body.ts";
import NewsRPMArticleSchema from "./schemas/newsrpm/v1/article.ts";

export const NewsRPMConfigSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().default("https://api.newsrpm.com"),
  requestDefaults: z
    .object({
      headers: z.record(z.string(), z.string()).exactOptional(),
      timeoutMs: z.number().exactOptional(),
    })
    .exactOptional(),
  retry: z
    .object({
      maxRetries: z.number().exactOptional(),
      baseDelayMs: z.number().exactOptional(),
      maxDelayMs: z.number().exactOptional(),
      jitter: z.boolean().exactOptional(),
    })
    .exactOptional(),
});
export type ParsedNewsRPMConfig = z.output<typeof NewsRPMConfigSchema>;

export const IndexedDataSearchSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  count: z.number().exactOptional(),
  offset: z.number().exactOptional(),
  minDate: z.number().exactOptional().describe("Unix timestamp in milliseconds"),
  maxDate: z.number().exactOptional().describe("Unix timestamp in milliseconds"),
  order: z.enum(["date", "dateWithQuality"]).exactOptional(),
});

export type IndexedDataSearch = z.input<typeof IndexedDataSearchSchema>;

export const ArticleSearchSchema = z.object({
  publisher: z.union([z.string(), z.array(z.string())]).exactOptional(),
  provider: z.union([z.string(), z.array(z.string())]).exactOptional(),
  providerCode: z.union([z.string(), z.array(z.string())]).exactOptional(),
  fullText: z.string().exactOptional(),
  type: z.union([z.string(), z.array(z.string())]).exactOptional(),
  sponsored: z.union([z.boolean(), z.number()]).exactOptional(),
  count: z.coerce.number().int().min(1, "Invalid count: parameter").max(100, "Invalid count: parameter").default(25),
  offset: z.coerce.number().int().min(0, "Invalid offset: parameter").max(1000, "Invalid offset: parameter").default(0),
  minDate: z.coerce
    .date()
    .refine(v => !Number.isNaN(v.getTime()), {
      message: "Invalid minDate= parameter",
    })
    .exactOptional(),
  maxDate: z.coerce
    .date()
    .refine(v => !Number.isNaN(v.getTime()), {
      message: "Invalid maxDate= parameter",
    })
    .exactOptional(),
  language: z.union([z.string(), z.array(z.string())]).exactOptional(),
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
  rows: z.array(z.object({ provider: z.string() })),
});

export const ArticleBodyResponseSchema = z.object({
  success: z.boolean(),
  body: NewsRPMArticleBodySchema,
});

export type MultipleArticleResponse = z.infer<typeof MultipleArticleResponseSchema>;
export type SingleArticleResponse = z.infer<typeof SingleArticleResponseSchema>;
export type ProviderListResponse = z.infer<typeof ProviderListResponseSchema>;
export type ArticleBodyResponse = z.infer<typeof ArticleBodyResponseSchema>;
