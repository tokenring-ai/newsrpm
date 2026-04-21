import type { Agent } from "@tokenring-ai/agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import NewsRPMService from "../NewsRPMService.ts";

const description = "List providers present in this NewsRPM instance";
const name = "newsrpm_listProviders";
const displayName = "Newsrpm/listProviders";

async function execute(_args: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const service = agent.requireServiceByType(NewsRPMService);
  const result = await service.listProviders();
  return JSON.stringify(result);
}

const inputSchema = z.object({});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
