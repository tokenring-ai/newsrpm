import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Get a NewsRPM article by slug";

export async function execute(args: { slug: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.getArticleBySlug(args.slug);
}
