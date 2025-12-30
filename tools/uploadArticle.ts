import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Upload (create/update) an article to NewsRPM";
const name = "newsrpm_uploadArticle";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.article) {
    throw new Error(`[${name}] Article is required`);
  }
  return await service.uploadArticle(args.article);
}

const inputSchema = z.object({
  article: z.any().describe("Article object to upload. See pkg/newsrpm/design/newsrpm.openapi.json#/components/schemas/article for the detailed schema")
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;