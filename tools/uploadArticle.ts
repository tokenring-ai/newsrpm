import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Upload (create/update) an article to NewsRPM";
const name = "newsrpm_uploadArticle";
const displayName = "Newsrpm/uploadArticle";

async function execute(args: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolJSONResult<any>> {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.article) {
    throw new Error(`[${name}] Article is required`);
  }
  const result = await service.uploadArticle(args.article);
  return {
    type: "json",
    data: result
  };
}

const inputSchema = z.object({
  article: z.any().describe("Article object to upload. See pkg/newsrpm/design/newsrpm.openapi.json#/components/schemas/article for the detailed schema")
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;