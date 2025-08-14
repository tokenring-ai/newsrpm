import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";
import { z } from "zod";

export const description = "Search NewsRPM indexedData by taxonomy key/value";

export async function execute(args: { key?: string; value?: string | string[]; count?: number; offset?: number; minDate?: string; maxDate?: string; order?: 'date'|'dateWithQuality' }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.key) {
      return {
          "error": "Key is required"
      }
  }
  return await service.searchIndexedData(args);
}

export const parameters = z.object({
  key: z.string().min(1).describe("Index key specifier (e.g., NormalizedTicker, topic, region)"),
  value: z.union([z.string(), z.array(z.string())]).optional().describe("Value to look up in the index (string or array of strings)"),
  count: z.number().int().optional().describe("Number of articles to return"),
  offset: z.number().int().optional().describe("How many articles to skip before returning results"),
  minDate: z.string().optional().describe("Earliest date to return (inclusive, ISO 8601)"),
  maxDate: z.string().optional().describe("Latest date to return (inclusive, ISO 8601)"),
  order: z.enum(["date", "dateWithQuality"]).optional().describe("Sort order: date or dateWithQuality")
});
