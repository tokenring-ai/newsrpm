import type {Agent} from "@tokenring-ai/agent";
import type {TokenRingToolDefinition, TokenRingToolJSONResult,} from "@tokenring-ai/chat/schema";

import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Search NewsRPM indexedData by taxonomy key/value";
const name = "newsrpm_searchIndexedData";
const displayName = "Newsrpm/searchIndexedData";

async function execute(
  args: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolJSONResult<any>> {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.key) {
    throw new Error(`[${name}] Key is required`);
  }
  // Convert string dates to Unix timestamps for the API
  const payload = {
    key: args.key,
    value: args.value ?? "",
    count: args.count,
    offset: args.offset,
    minDate: args.minDate ? Date.parse(args.minDate) : undefined,
    maxDate: args.maxDate ? Date.parse(args.maxDate) : undefined,
    order: args.order,
  };
  const result = await service.searchIndexedData(payload);
  return {
    type: "json",
    data: result,
  };
}

const inputSchema = z.object({
  key: z
    .string()
    .min(1)
    .describe("Index key specifier (e.g., NormalizedTicker, topic, region)"),
  value: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Value to look up in the index (string or array of strings)"),
  count: z.number().int().optional().describe("Number of articles to return"),
  offset: z
    .number()
    .int()
    .optional()
    .describe("How many articles to skip before returning results"),
  minDate: z
    .string()
    .optional()
    .describe("Earliest date to return (inclusive, ISO 8601)"),
  maxDate: z
    .string()
    .optional()
    .describe("Latest date to return (inclusive, ISO 8601)"),
  order: z
    .enum(["date", "dateWithQuality"])
    .optional()
    .describe("Sort order: date or dateWithQuality"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
