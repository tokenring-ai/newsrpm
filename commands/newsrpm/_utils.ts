import Agent from "@tokenring-ai/agent/Agent";
import {FileSystemService} from "@tokenring-ai/filesystem";

export function parseFlags(args: string[]): { flags: Record<string, string | number | boolean>; rest: string[] } {
  const flags: Record<string, string | number | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (["--value", "--count", "--offset", "--min", "--max", "--order", "--publisher", "--provider", "--type", "--fulltext", "--language", "--json", "--save"].includes(a)) {
      flags[a.slice(2)] = args[i + 1];
      i++;
      continue;
    }
    if (a === "--sponsored") { flags.sponsored = args[i + 1] === 'true'; i++; continue; }
    if (a === "--render") { flags.render = true; continue; }
    if (a.startsWith("--")) { flags[a.slice(2)] = true; continue; }
    rest.push(a);
  }
  return {flags, rest};
}

export async function saveIfRequested(data: any, flags: Record<string, string | number | boolean>, agent: Agent): Promise<string> {
  if (flags.save) {
    const path = String(flags.save);
    await agent.requireServiceByType(FileSystemService).writeFile(path, JSON.stringify(data, null, 2), agent);
    return `Saved raw JSON to ${path}`;
  }
  return "";
}
