import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Search NewsRPM articles by publisher/provider/type/fullText";

export async function execute(args: { publisher?: string|string[]; provider?: string|string[]; fullText?: string; type?: string|string[]; sponsored?: boolean; count?: number; offset?: number; minDate?: string; maxDate?: string; language?: string }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.searchArticles(args);
}
