import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "List providers present in this NewsRPM instance";
export const name = "newsrpm/listProviders";

export async function execute(_args: {}, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.listProviders();
}

export const inputSchema = z.object({});
