import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {formatAgentCommandUsageError} from "@tokenring-ai/agent/util/formatAgentCommandUsage";
import NewsRPMService from "../../NewsRPMService.ts";
import {saveIfRequested} from "./_utils.ts";

const inputSchema = {
  args: {
    "--slug": {
      type: "string",
      description: "Article slug to retrieve",
    },
    "--id": {
      type: "number",
      description: "Article ID to retrieve",
    },
    "--save": {
      type: "string",
      description: "Write the raw JSON response to a file",
    },
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const command = {
  name: "newsrpm article",
  description: "Get article by slug or ID",
  help: `Get article by slug or ID.

## Examples

/newsrpm article --slug "my-article-slug"
/newsrpm article --id 12345`,
  inputSchema,
  execute: async ({args, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const nrpm = agent.requireServiceByType(NewsRPMService);
    const slug = args["--slug"];
    const id = args["--id"];

    if ((slug && id !== undefined) || (!slug && id === undefined)) {
      throw new CommandFailedError(
        formatAgentCommandUsageError(command, "Provide exactly one of --slug or --id."),
      );
    }

    if (slug) {
      const res = await nrpm.getArticleBySlug(slug);
      const saved = await saveIfRequested(res, args, agent);
      return (res?.doc?.headline ?? "(no headline)") + (saved ? "\n" + saved : "");
    }

    if (!id) {
      throw new CommandFailedError(
        formatAgentCommandUsageError(command, "Argument --id must be a non-zero article ID."),
      );
    }

    const res = await nrpm.getArticleById(id);
    const saved = await saveIfRequested(res, args, agent);
    return (res?.doc?.headline ?? "(no headline)") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;

export default command;
