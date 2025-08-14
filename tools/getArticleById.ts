import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Get a NewsRPM article by id";

export async function execute(args: { id: number }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.getArticleById(args.id);
}
