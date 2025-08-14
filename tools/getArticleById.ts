import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";
import { z } from "zod";

export const description = "Get a NewsRPM article by id";

export async function execute(args: { id?: number }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.id) {
      return {
          "error": "ID is required"
      }
  }
  return await service.getArticleById(args.id);
}

export const parameters = z.object({
  id: z.number().int().describe("The local numeric identifier of the article to retrieve")
});
