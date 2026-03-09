import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags, saveIfRequested} from "./_utils.ts";

export default {
  name: "newsrpm body",
  description: "/newsrpm body <bodyId> [--render] - Get article body content",
  help: `# /newsrpm body\n\nGet article body content.\n\n**Options:** --render, --save\n\n## Example\n\n/newsrpm body abc123 --render`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags, rest} = parseFlags(remainder.trim().split(/\s+/));
    const [bodyId] = rest;
    if (!bodyId) throw new CommandFailedError("Usage: /newsrpm body <bodyId> [--render]");
    const nrpm = agent.requireServiceByType(NewsRPMService);
    const res = flags.render ? await nrpm.renderBody(bodyId) : await nrpm.getBody(bodyId);
    const saved = await saveIfRequested(res, flags, agent);
    return `Body chunks: ${res?.body?.chunks?.length ?? 0}` + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand;
