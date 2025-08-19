import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Get a NewsRPM article by slug";
export const name = "newsrpm/getArticleBySlug";

export async function execute(args: { slug?: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.slug) {
    throw new Error(`[${name}] Slug is required`);
  }
  return await service.getArticleBySlug(args.slug);
}

export const inputSchema = z.object({
  slug: z.string().min(1).describe("The unique slug identifier of the article to retrieve")
});
