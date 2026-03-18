import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {FileSystemService} from "@tokenring-ai/filesystem";
import NewsRPMService from "../../NewsRPMService.ts";

const inputSchema = {
  args: {
    "--json": {
      type: "string",
      description: "Path to the article JSON file to upload",
      required: true,
    },
  }
} as const satisfies AgentCommandInputSchema;

export default {
  name: "newsrpm upload",
  description: "Upload article from JSON file",
  help: `Upload article from JSON file.

## Example

/newsrpm upload --json article.json`,
  inputSchema,
  execute: async ({args, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const jsonPath = args["--json"];
    const raw = await agent.requireServiceByType(FileSystemService).readTextFile(jsonPath, agent);
    if (!raw) throw new Error(`Failed to read file: ${jsonPath}`);
    const res = await agent.requireServiceByType(NewsRPMService).uploadArticle(JSON.parse(raw));
    return `Uploaded. id=${res?.id}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
