import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags, saveIfRequested} from "./_utils.ts";

export default {
  name: "newsrpm providers",
  description: "List available news providers",
  help: `# /newsrpm providers\n\nList available news providers.\n\n## Example\n\n/newsrpm providers --save providers.json`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags} = parseFlags(remainder.trim().split(/\s+/).filter(Boolean));
    const res = await agent.requireServiceByType(NewsRPMService).listProviders();
    const providers = Array.isArray(res?.rows) ? res.rows.map((r: any) => r.provider).filter(Boolean) : [];
    const lines = providers.length ? ["Providers:", ...providers.map((p: string) => `- ${p}`)] : ["No providers returned."];
    const saved = await saveIfRequested(res, flags, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand;
