import type {Agent} from "@tokenring-ai/agent";
import type {TokenRingToolDefinition, TokenRingToolResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Get a NewsRPM article by id";

const name = "newsrpm_getArticleById";
const displayName = "Newsrpm/getArticleById";

async function execute(
  args: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolResult> {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.id) {
    throw new Error(`[${name}] ID is required`);
  }
  const result = await service.getArticleById(args.id);
  return JSON.stringify(result);
}

const inputSchema = z.object({
  id: z
    .number()
    .int()
    .describe("The local numeric identifier of the article to retrieve"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
