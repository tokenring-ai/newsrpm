import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Search NewsRPM articles by publisher/provider/type/fullText";
export const name = "newsrpm/searchArticles";

export async function execute(args: {
  publisher?: string | string[];
  provider?: string | string[];
  fullText?: string;
  type?: string | string[];
  sponsored?: boolean;
  count?: number;
  offset?: number;
  minDate?: string;
  maxDate?: string;
  language?: string
}, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  return await service.searchArticles(args);
}

export const inputSchema = z.object({
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
