import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";
import { z } from "zod";

export const description = "Retrieve an article body (native format) by bodyId";

export async function execute(args: { bodyId?: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  if (!args.bodyId) {
      return {
          "error": "Body ID is required"
      }
  }
  return await service.getBody(args.bodyId);
}

export const parameters = z.object({
  bodyId: z.string().min(1).describe("Body ID of the article body to retrieve")
});
