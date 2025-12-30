import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "List providers present in this NewsRPM instance";
const name = "newsrpm_listProviders";

async function execute(_args: z.infer<typeof inputSchema>, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  return await service.listProviders();
}

const inputSchema = z.object({});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;