import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Retrieve a rendered (HTML) article body by bodyId";
export const name = "newsrpm/renderBody";

export async function execute(args: { bodyId?: string }, agent: Agent) {
  const service = agent.requireFirstServiceByType(NewsRPMService);
  if (!args.bodyId) {
    throw new Error(`[${name}] Body ID is required`);
  }
  return await service.renderBody(args.bodyId);
}

export const inputSchema = z.object({
  bodyId: z.string().min(1).describe("Body ID of the article body to retrieve (rendered)")
});
