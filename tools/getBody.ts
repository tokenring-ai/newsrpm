import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Retrieve an article body (native format) by bodyId";
const name = "newsrpm_getBody";
const displayName = "Newsrpm/getBody";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.bodyId) {
    throw new Error(`[${name}] Body ID is required`);
  }
  return await service.getBody(args.bodyId);
}

const inputSchema = z.object({
  bodyId: z.string().min(1).describe("Body ID of the article body to retrieve")
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;