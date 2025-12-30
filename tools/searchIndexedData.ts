import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";

import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Search NewsRPM indexedData by taxonomy key/value";
const name = "newsrpm_searchIndexedData";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.key) {
    throw new Error(`[${name}] Key is required`);
  }
  return await service.searchIndexedData(args);
}

const inputSchema = z.object({
  key: z.string().min(1).describe("Index key specifier (e.g., NormalizedTicker, topic, region)"),
  value: z.union([z.string(), z.array(z.string())]).optional().describe("Value to look up in the index (string or array of strings)"),
  count: z.number().int().optional().describe("Number of articles to return"),
  offset: z.number().int().optional().describe("How many articles to skip before returning results"),
  minDate: z.string().optional().describe("Earliest date to return (inclusive, ISO 8601)"),
  maxDate: z.string().optional().describe("Latest date to return (inclusive, ISO 8601)"),
  order: z.enum(["date", "dateWithQuality"]).optional().describe("Sort order: date or dateWithQuality")
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
