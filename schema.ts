import {z} from "zod";

export const NewsRPMConfigSchema = z.object({
  apiKey: z.string(),
  authMode: z.enum(['privateHeader', 'publicHeader', 'privateQuery', 'publicQuery']).optional(),
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