import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {FileSystemService} from "@tokenring-ai/filesystem";
import NewsRPMService from "../../NewsRPMService.ts";
import {parseFlags} from "./_utils.ts";

export default {
  name: "newsrpm upload",
  description: "/newsrpm upload --json <path> - Upload article from JSON file",
  help: `# /newsrpm upload\n\nUpload article from JSON file.\n\n## Example\n\n/newsrpm upload --json article.json`,
  execute: async (remainder: string, agent: Agent): Promise<string> => {
    const {flags} = parseFlags(remainder.trim().split(/\s+/).filter(Boolean));
    const jsonPath = flags.json as string | undefined;
    if (!jsonPath) throw new CommandFailedError("Usage: /newsrpm upload --json <path>");
    const raw = await agent.requireServiceByType(FileSystemService).readTextFile(jsonPath, agent);
    if (!raw) throw new CommandFailedError(`Failed to read file: ${jsonPath}`);
    const res = await agent.requireServiceByType(NewsRPMService).uploadArticle(JSON.parse(raw));
    return `Uploaded. id=${res?.id}`;
  },
} satisfies TokenRingAgentCommand;
