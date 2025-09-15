
import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Get a NewsRPM article by id";

export const name = "newsrpm/getArticleById";

export async function execute(args: { id?: number }, agent: Agent) {
  const service = agent.requireFirstServiceByType(NewsRPMService);
  if (!args.id) {
    throw new Error(`[${name}] ID is required`);
  }
  return await service.getArticleById(args.id);
}

export const inputSchema = z.object({
  id: z.number().int().describe("The local numeric identifier of the article to retrieve")
});
