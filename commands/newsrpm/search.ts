import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { stripUndefinedKeys } from "@tokenring-ai/utility/object/stripObject";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import NewsRPMService from "../../NewsRPMService.ts";
import { saveIfRequested } from "./_utils.ts";

const inputSchema = {
  args: {
    publisher: {
      type: "string",
      description: "Comma-separated publisher filters",
    },
    provider: {
      type: "string",
      description: "Comma-separated provider filters",
    },
    type: {
      type: "string",
      description: "Comma-separated article type filters",
    },
    fulltext: {
      type: "string",
      description: "Full-text query string",
    },
    sponsored: {
      type: "flag",
      description: "Filter sponsored content; pass false to exclude it",
    },
    language: {
      type: "string",
      description: "Language filter",
    },
    count: {
      type: "number",
      description: "Maximum number of results to return",
    },
    offset: {
      type: "number",
      description: "Result offset for pagination",
    },
    min: {
      type: "string",
      description: "Minimum publication date filter",
    },
    max: {
      type: "string",
      description: "Maximum publication date filter",
    },
    save: {
      type: "string",
      description: "Write the raw JSON response to a file",
    },
  },
} as const satisfies AgentCommandInputSchema;

export default {
  name: "newsrpm search",
  description: "Search articles with filters",
  help: `Search articles with filters.\n
**Options:** --publisher, --provider, --type, --fulltext, --sponsored, --language, --count, --offset, --min, --max, --save

## Example

/newsrpm search --fulltext "AI" --count 10 --publisher "Reuters"`,
  inputSchema,
  execute: async ({ args, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const splitCsv = (value?: string) =>
      value
        ?.split(",")
        .map(entry => entry.trim())
        .filter(Boolean);
    const rows = await agent.requireServiceByType(NewsRPMService).searchArticles(
      stripUndefinedKeys({
        publisher: splitCsv(args.publisher),
        provider: splitCsv(args.provider),
        type: splitCsv(args.type),
        fullText: args.fulltext,
        sponsored: args.sponsored,
        count: args.count,
        offset: args.offset,
        minDate: args.min,
        maxDate: args.max,
        language: args.language,
      }),
    );

    const top = Array.isArray(rows?.rows) ? rows.rows.slice(0, 5) : [];
    const lines = top.length
      ? ["Top results:", markdownList(top.map((a: any) => `${a.headline ?? "(no headline)"} [${a.provider ?? ""}] ${a.slug ?? ""}`))]
      : ["No results."];
    const saved = await saveIfRequested(rows, args, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
