import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import NewsRPMService from "../../NewsRPMService.ts";
import { saveIfRequested } from "./_utils.ts";

const inputSchema = {
  args: {
    save: {
      type: "string",
      description: "Write the raw JSON response to a file",
    },
  },
} as const satisfies AgentCommandInputSchema;

export default {
  name: "newsrpm providers",
  description: "List available news providers",
  help: `List available news providers.

## Example

/newsrpm providers --save providers.json`,
  inputSchema,
  execute: async ({ args, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const res = await agent.requireServiceByType(NewsRPMService).listProviders();
    const providers = Array.isArray(res?.rows) ? res.rows.map((r: any) => r.provider).filter(Boolean) : [];
    const lines = providers.length ? ["Providers:", ...providers.map((p: string) => `- ${p}`)] : ["No providers returned."];
    const saved = await saveIfRequested(res, args, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
