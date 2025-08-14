import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Upload (create/update) an article to NewsRPM";

export async function execute(args: { article: any }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.uploadArticle(args.article);
}
