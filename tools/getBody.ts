import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Retrieve an article body (native format) by bodyId";
export const name = "newsrpm/getBody";

export async function execute(args: { bodyId?: string }, agent: Agent) {
  const service = agent.requireServiceByType(NewsRPMService);
  if (!args.bodyId) {
    throw new Error(`[${name}] Body ID is required`);
  }
  return await service.getBody(args.bodyId);
}

export const inputSchema = z.object({
  bodyId: z.string().min(1).describe("Body ID of the article body to retrieve")
});
