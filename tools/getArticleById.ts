import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Get a NewsRPM article by id";

const name = "newsrpm_getArticleById";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.id) {
    throw new Error(`[${name}] ID is required`);
  }
  return await service.getArticleById(args.id);
}

const inputSchema = z.object({
  id: z.number().int().describe("The local numeric identifier of the article to retrieve")
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;