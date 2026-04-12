import type {Agent} from "@tokenring-ai/agent";
import type {TokenRingToolDefinition, TokenRingToolResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Get a NewsRPM article by slug";
const name = "newsrpm_getArticleBySlug";
const displayName = "Newsrpm/getArticleBySlug";

async function execute(
  args: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolResult> {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.slug) {
    throw new Error(`[${name}] Slug is required`);
  }
  const result = await service.getArticleBySlug(args.slug);
  return JSON.stringify(result);
}

const inputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .describe("The unique slug identifier of the article to retrieve"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
