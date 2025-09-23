import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Upload (create/update) an article to NewsRPM";
export const name = "newsrpm/uploadArticle";

export async function execute(args: { article?: any }, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.article) {
    throw new Error(`[${name}] Article is required`);
  }
  return await service.uploadArticle(args.article);
}

export const inputSchema = z.object({
  article: z.any().describe("Article object to upload. See pkg/newsrpm/design/newsrpm.openapi.json#/components/schemas/article for the detailed schema")
});
