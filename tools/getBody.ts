import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Retrieve an article body (native format) by bodyId";

export async function execute(args: { bodyId: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.getBody(args.bodyId);
}
