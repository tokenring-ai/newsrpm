
import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "List providers present in this NewsRPM instance";
export const name = "newsrpm/listProviders";

export async function execute(_args: {}, agent: Agent) {
  const service = agent.requireFirstServiceByType(NewsRPMService);
  return await service.listProviders();
}

export const inputSchema = z.object({});
