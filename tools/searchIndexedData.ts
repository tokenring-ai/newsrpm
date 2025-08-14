import type { Registry } from "@token-ring/registry";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "Search NewsRPM indexedData by taxonomy key/value";

export async function execute(args: { key: string; value?: string | string[]; count?: number; offset?: number; minDate?: string; maxDate?: string; order?: 'date'|'dateWithQuality' }, registry: Registry) {
  const service = registry.requireFirstServiceByType(NewsRPMService);
  return await service.searchIndexedData(args);
}
