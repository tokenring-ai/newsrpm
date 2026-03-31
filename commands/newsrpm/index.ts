import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import NewsRPMService from "../../NewsRPMService.ts";
import {saveIfRequested} from "./_utils.ts";

const inputSchema = {
  args: {
    "--value": {
      type: "string",
      description: "Exact value or comma-separated values to match",
    },
    "--count": {
      type: "number",
      description: "Maximum number of results to return",
    },
    "--offset": {
      type: "number",
      description: "Result offset for pagination",
    },
    "--min": {
      type: "string",
      description: "Minimum publication date filter",
    },
    "--max": {
      type: "string",
      description: "Maximum publication date filter",
    },
    "--order": {
      type: "string",
      description: "Sort order to request from NewsRPM",
    },
    "--save": {
      type: "string",
      description: "Write the raw JSON response to a file",
    },
  },
  positionals: [{
    name: "key",
    description: "Indexed field key to search",
    required: true,
  }]
} as const satisfies AgentCommandInputSchema;

export default {
  name: "newsrpm index",
  description: "Search indexed data by key",
  help: `Search indexed data by key.

## Example

/newsrpm index publisher --value "Reuters,BBC" --count 20`,
  inputSchema,
  execute: async ({positionals, args, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    let value: string | string[] | undefined = args["--value"];
    if (value?.includes(",")) {
      value = value.split(",").map((entry) => entry.trim()).filter(Boolean);
    }

    const res = await agent.requireServiceByType(NewsRPMService).searchIndexedData({
      key: positionals.key,
      value: value ?? "",
      count: args["--count"],
      offset: args["--offset"],
      minDate: args["--min"] ? Date.parse(args["--min"]) : undefined,
      maxDate: args["--max"] ? Date.parse(args["--max"]) : undefined,
      order: args["--order"] as "date" | "dateWithQuality" | undefined,
    });
    const top = Array.isArray(res?.rows) ? res.rows.slice(0, 5) : [];
    const lines = top.length
      ? ["Top results:", ...top.map((a: any) => `- ${a.headline ?? "(no headline)"} [${a.provider ?? ""}] ${a.slug ?? ""}`)]
      : ["No results."];
    const saved = await saveIfRequested(res, args, agent);
    return lines.join("\n") + (saved ? "\n" + saved : "");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
