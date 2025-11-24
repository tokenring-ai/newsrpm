import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Get a NewsRPM article by slug";
const name = "newsrpm/getArticleBySlug";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.slug) {
    throw new Error(`[${name}] Slug is required`);
  }
  return await service.getArticleBySlug(args.slug);
}

const inputSchema = z.object({
  slug: z.string().min(1).describe("The unique slug identifier of the article to retrieve")
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;