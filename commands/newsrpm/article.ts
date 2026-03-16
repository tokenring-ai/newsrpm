import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags, saveIfRequested} from "./_utils.ts";

export default {
  name: "newsrpm article",
  description: "Get article by slug or ID",
  help: `# /newsrpm article\n\nGet article by slug or ID.\n\n## Examples\n\n/newsrpm article slug "my-article-slug"\n/newsrpm article id 12345`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags, rest} = parseFlags(remainder.trim().split(/\s+/));
    const [which, value] = rest;
    const nrpm = agent.requireServiceByType(NewsRPMService);
    if (which === 'slug') {
      if (!value) throw new CommandFailedError("Usage: /newsrpm article slug <slug>");
      const res = await nrpm.getArticleBySlug(value);
      const saved = await saveIfRequested(res, flags, agent);
      return (res?.doc?.headline ?? "(no headline)") + (saved ? "\n" + saved : "");
    } else if (which === 'id') {
      const id = Number(value);
      if (!id) throw new CommandFailedError("Usage: /newsrpm article id <id>");
      const res = await nrpm.getArticleById(id);
      const saved = await saveIfRequested(res, flags, agent);
      return (res?.doc?.headline ?? "(no headline)") + (saved ? "\n" + saved : "");
    }
    throw new CommandFailedError("Usage: /newsrpm article slug <slug> | id <id>");
  },
} satisfies TokenRingAgentCommand;
