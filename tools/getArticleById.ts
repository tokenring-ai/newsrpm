import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Get a NewsRPM article by id";

const name = "newsrpm_getArticleById";
const displayName = "Newsrpm/getArticleById";

async function execute(args: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolJSONResult<any>> {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.id) {
    throw new Error(`[${name}] ID is required`);
  }
  const result = await service.getArticleById(args.id);
  return {
    type: "json",
    data: result
  };
}

const inputSchema = z.object({
  id: z.number().int().describe("The local numeric identifier of the article to retrieve")
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;