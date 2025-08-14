import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";
import { z } from "zod";

export const description = "Upload (create/update) an article to NewsRPM";

export async function execute(args: { article?: any }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.article) {
      return {
          "error": "Article is required"
      }
  }
  return await service.uploadArticle(args.article);
}

export const parameters = z.object({
  article: z.any().describe("Article object to upload. See pkg/newsrpm/design/newsrpm.openapi.json#/components/schemas/article for the detailed schema")
});
