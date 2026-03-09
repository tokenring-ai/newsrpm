import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags, saveIfRequested} from "./_utils.ts";

export default {
  name: "newsrpm search",
  description: "/newsrpm search [options] - Search articles with filters",
  help: `# /newsrpm search\n\nSearch articles with filters.\n\n**Options:** --publisher, --provider, --type, --fulltext, --sponsored, --language, --count, --offset, --min, --max, --save\n\n## Example\n\n/newsrpm search --fulltext "AI" --count 10 --publisher "Reuters"`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags} = parseFlags(remainder.trim().split(/\s+/).filter(Boolean));
    const splitCsv = (v: any) => v ? String(v).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined;
    const rows = await agent.requireServiceByType(NewsRPMService).searchArticles({
      publisher: splitCsv(flags.publisher),
      provider: splitCsv(flags.provider),
      type: splitCsv(flags.type),
      fullText: flags.fulltext as string | undefined,
      sponsored: typeof flags.sponsored === 'boolean' ? flags.sponsored : undefined,
      count: flags.count ? Number(flags.count) : undefined,
      offset: flags.offset ? Number(flags.offset) : undefined,
      minDate: flags.min as string | undefined,
      maxDate: flags.max as string | undefined,
      language: flags.language as string | undefined,
    });
    const top = Array.isArray(rows?.rows) ? rows.rows.slice(0, 5) : [];
    const lines = top.length
      ? ["Top results:", markdownList(top.map((a: any) => `${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`))]
      : ["No results."];
    const saved = await saveIfRequested(rows, flags, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand;
