import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags, saveIfRequested} from "./_utils.ts";

export default {
  name: "newsrpm index",
  description: "/newsrpm index <key> [options] - Search indexed data by key",
  help: `# /newsrpm index\n\nSearch indexed data by key.\n\n**Options:** --value, --count, --offset, --min, --max, --order, --save\n\n## Example\n\n/newsrpm index publisher --value "Reuters,BBC" --count 20`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags, rest} = parseFlags(remainder.trim().split(/\s+/));
    const [key] = rest;
    if (!key) throw new CommandFailedError("Usage: /newsrpm index <key> [flags]");
    let value: string | string[] | undefined = flags.value as string | undefined;
    if (value && (value as string).includes(',')) value = (value as string).split(',').map(s => s.trim()).filter(Boolean);
    const res = await agent.requireServiceByType(NewsRPMService).searchIndexedData({
      key,
      value,
      count: flags.count ? Number(flags.count) : undefined,
      offset: flags.offset ? Number(flags.offset) : undefined,
      minDate: flags.min,
      maxDate: flags.max,
      order: flags.order || undefined,
    });
    const top = Array.isArray(res?.rows) ? res.rows.slice(0, 5) : [];
    const lines = top.length
      ? ["Top results:", ...top.map((a: any) => `- ${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`)]
      : ["No results."];
    const saved = await saveIfRequested(res, flags, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand;
