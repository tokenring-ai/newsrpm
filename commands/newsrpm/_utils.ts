import type Agent from "@tokenring-ai/agent/Agent";
import {FileSystemService} from "@tokenring-ai/filesystem";

export type SaveableAgentCommandArgs = {
  "save"?: string;
};

export async function saveIfRequested(
  data: any,
  args: SaveableAgentCommandArgs,
  agent: Agent,
): Promise<string> {
  if (args.save) {
    const path = args.save;
    await agent
      .requireServiceByType(FileSystemService)
      .writeFile(path, JSON.stringify(data, null, 2), agent);
    return `Saved raw JSON to ${path}`;
  }
  return "";
}
