import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Search NewsRPM articles by publisher/provider/type/fullText";
const name = "newsrpm/searchArticles";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  return await service.searchArticles(args);
}

const inputSchema = z.object({
  publisher: z.union([z.string(), z.array(z.string())]).optional().describe("Name(s) of the publisher to search for"),
  provider: z.union([z.string(), z.array(z.string())]).optional().describe("Name(s) of the provider to search for"),
  fullText: z.string().optional().describe("Full text query to execute against the article headline"),
  type: z.union([z.string(), z.array(z.string())]).optional().describe("Type(s) of article to search for"),
  sponsored: z.boolean().optional().describe("Restrict to sponsored or non-sponsored content"),
  count: z.number().int().optional().describe("Number of articles to return"),
  offset: z.number().int().optional().describe("How many articles to skip before returning results"),
  minDate: z.string().optional().describe("Earliest date to return (inclusive, ISO 8601)"),
  maxDate: z.string().optional().describe("Latest date to return (inclusive, ISO 8601)"),
  language: z.string().optional().describe("Filter by article language")
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
