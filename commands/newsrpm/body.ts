import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import NewsRPMService from "../../NewsRPMService.ts";
import {saveIfRequested} from "./_utils.ts";

const inputSchema = {
  args: {
    "--render": {
      type: "flag",
      description:
        "Render the body content instead of returning the raw body record",
    },
    "--save": {
      type: "string",
      description: "Write the raw JSON response to a file",
    },
  },
  positionals: [
    {
      name: "bodyId",
      description: "Body ID to retrieve",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "newsrpm body",
  description: "Get article body content",
  help: `Get article body content.

## Example

/newsrpm body abc123
/newsrpm body --render abc123`,
  inputSchema,
  execute: async ({
                    positionals,
                    args,
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    if (!positionals.bodyId)
      throw new CommandFailedError("Usage: /newsrpm body <bodyId> [--render]");
    const nrpm = agent.requireServiceByType(NewsRPMService);
    const res = args["--render"]
      ? await nrpm.renderBody(positionals.bodyId)
      : await nrpm.getBody(positionals.bodyId);
    const saved = await saveIfRequested(res, args, agent);
    return (
      `Body chunks: ${res?.body?.chunks?.length ?? 0}` +
      (saved ? "\n" + saved : "")
    );
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
