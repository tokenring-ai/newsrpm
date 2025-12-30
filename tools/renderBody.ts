import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "Retrieve a rendered (HTML) article body by bodyId";
const name = "newsrpm_renderBody";

async function execute(args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.bodyId) {
    throw new Error(`[${name}] Body ID is required`);
  }
  return await service.renderBody(args.bodyId);
}

const inputSchema = z.object({
  bodyId: z.string().min(1).describe("Body ID of the article body to retrieve (rendered)")
});
export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
