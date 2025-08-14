import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "List providers present in this NewsRPM instance";

export async function execute(_args: {}, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.listProviders();
}
