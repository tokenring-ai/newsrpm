import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";
import { z } from "zod";

export const description = "Get a NewsRPM article by slug";

export async function execute(args: { slug?: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.slug) {
      return {
          "error": "Slug is required"
      }
  }
  return await service.getArticleBySlug(args.slug);
}

export const parameters = z.object({
  slug: z.string().min(1).describe("The unique slug identifier of the article to retrieve")
});
