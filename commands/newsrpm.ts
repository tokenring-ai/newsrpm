import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {FileSystemService} from "@tokenring-ai/filesystem";
import NewsRPMService from "../NewsRPMService.ts";

const description = "/newsrpm [index|search|article|providers|body|upload] - Interact with NewsRPM";

const help: string = `# NewsRPM Command

Interact with NewsRPM service for news articles and data.

## Usage

\`/newsrpm [action] [options]\`

## Actions

### \`index <key> [options]\`
Search indexed data by key.

**Options:**
- \`--value <values>\` - Filter by value(s), comma-separated for multiple
- \`--count <n>\` - Limit number of results
- \`--offset <n>\` - Skip number of results
- \`--min <iso>\` - Minimum date (ISO format)
- \`--max <iso>\` - Maximum date (ISO format)
- \`--order <order>\` - Sort order
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm index publisher --value "Reuters,BBC" --count 20
\`\`\`

### \`search [options]\`
Search articles with filters.

**Options:**
- \`--publisher <names>\` - Filter by publisher(s), comma-separated
- \`--provider <names>\` - Filter by provider(s), comma-separated
- \`--type <types>\` - Filter by type(s), comma-separated
- \`--fulltext <query>\` - Full-text search query
- \`--sponsored <true|false>\` - Filter by sponsored status
- \`--language <lang>\` - Filter by language
- \`--count <n>\` - Limit number of results
- \`--offset <n>\` - Skip number of results
- \`--min <iso>\` - Minimum date (ISO format)
- \`--max <iso>\` - Maximum date (ISO format)
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm search --fulltext "AI" --count 10 --publisher "Reuters"
\`\`\`

### \`article slug <slug>\`
Get article by slug.

**Options:**
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm article slug "my-article-slug"
\`\`\`

### \`article id <id>\`
Get article by ID.

**Options:**
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm article id 12345
\`\`\`

### \`providers\`
List available news providers.

**Options:**
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm providers --save providers.json
\`\`\`

### \`body <bodyId> [options]\`
Get article body content.

**Options:**
- \`--render\` - Render the body content
- \`--save <path>\` - Save response to JSON file

**Example:**
\`\`\`
/newsrpm body abc123 --render
\`\`\`

### \`upload --json <path>\`
Upload article from JSON file.

**Example:**
\`\`\`
/newsrpm upload --json article.json
\`\`\`

## Common Options

- \`--save <path>\` - Save response to JSON file
- \`--count <n>\` - Limit number of results
- \`--offset <n>\` - Skip number of results  
- \`--min <iso>\` - Minimum date (ISO format)
- \`--max <iso>\` - Maximum date (ISO format)
`;

function parseFlags(args: string[]): { flags: Record<string, string | number | boolean>; rest: string[] } {
  const flags: Record<string, string | number | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (["--value", "--count", "--offset", "--min", "--max", "--order", "--publisher", "--provider", "--type", "--fulltext", "--language", "--json", "--save"].includes(a)) {
      flags[a.slice(2)] = args[i + 1];
      i++;
      continue;
    }
    if (a === "--sponsored") {
      flags.sponsored = args[i + 1] === 'true';
      i++;
      continue;
    }
    if (a === "--render") {
      flags.render = true;
      continue;
    }
    if (a.startsWith("--")) {
      flags[a.slice(2)] = true;
      continue;
    }
    rest.push(a);
  }
  return {flags, rest};
}

async function execute(remainder: string, agent: Agent): Promise<void> {
  const nrpm = agent.requireServiceByType(NewsRPMService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) {
    agent.infoLine(help);
    return;
  }
  const {flags, rest: r} = parseFlags(rest);

  const saveIfRequested = async (data: any) => {
    if (flags.save) {
      const fsService = agent.requireServiceByType(FileSystemService);
      const path = String(flags.save);
      await fsService.writeFile(path, JSON.stringify(data, null, 2), agent);
      agent.infoLine(`Saved raw JSON to ${path}`);
    }
  };

  try {
    if (sub === 'index') {
      const [key, ...restKey] = r;
      const keyArg = key;
      if (!keyArg) {
        agent.errorLine("Usage: /newsrpm index <key> [flags]");
        return;
      }
      let value: string | string[] | undefined = flags.value as string | undefined;
      if (value && value.includes(',')) value = value.split(',').map(s => s.trim()).filter(Boolean);
      const res = await nrpm.searchIndexedData({
        key: keyArg,
        value,
        count: flags.count ? Number(flags.count) : undefined,
        offset: flags.offset ? Number(flags.offset) : undefined,
        minDate: flags.min,
        maxDate: flags.max,
        order: flags.order || undefined,
      });
      const top = Array.isArray(res?.rows) ? res.rows.slice(0, 5) : [];
      if (top.length) {
        agent.infoLine("Top results:");
        for (const a of top) agent.infoLine(`- ${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`);
      } else {
        agent.infoLine("No results.");
      }
      await saveIfRequested(res);
    } else if (sub === 'search') {
      const rows = await nrpm.searchArticles({
        publisher: flags.publisher ? String(flags.publisher).split(',').map(s => s.trim()).filter(Boolean) : undefined,
        provider: flags.provider ? String(flags.provider).split(',').map(s => s.trim()).filter(Boolean) : undefined,
        type: flags.type ? String(flags.type).split(',').map(s => s.trim()).filter(Boolean) : undefined,
        fullText: flags.fulltext as string | undefined,
        sponsored: typeof flags.sponsored === 'boolean' ? (flags.sponsored as boolean) : undefined,
        count: flags.count ? Number(flags.count) : undefined,
        offset: flags.offset ? Number(flags.offset) : undefined,
        minDate: flags.min as string | undefined,
        maxDate: flags.max as string | undefined,
        language: flags.language as string | undefined,
      });
      const top = Array.isArray(rows?.rows) ? rows.rows.slice(0, 5) : [];
      if (top.length) {
        agent.infoLine("Top results:");
        for (const a of top) agent.infoLine(`- ${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`);
      } else {
        agent.infoLine("No results.");
      }
      await saveIfRequested(rows);
    } else if (sub === 'article') {
      const which = r[0];
      if (which === 'slug') {
        const slug = r[1];
        if (!slug) {
          agent.errorLine("Usage: /newsrpm article slug <slug>");
          return;
        }
        const res = await nrpm.getArticleBySlug(slug);
        agent.infoLine(res?.doc?.headline ?? "(no headline)");
        await saveIfRequested(res);
      } else if (which === 'id') {
        const id = Number(r[1]);
        if (!id) {
          agent.errorLine("Usage: /newsrpm article id <id>");
          return;
        }
        const res = await nrpm.getArticleById(id);
        agent.infoLine(res?.doc?.headline ?? "(no headline)");
        await saveIfRequested(res);
      } else {
        agent.errorLine("Usage: /newsrpm article slug <slug> | id <id>");
      }
    } else if (sub === 'providers') {
      const res = await nrpm.listProviders();
      const providers = Array.isArray(res?.rows) ? res.rows.map((r: any) => r.provider).filter(Boolean) : [];
      if (providers.length) {
        agent.infoLine("Providers:");
        for (const p of providers) agent.infoLine(`- ${p}`);
      } else agent.infoLine("No providers returned.");
      await saveIfRequested(res);
    } else if (sub === 'body') {
      const bodyId = r[0];
      if (!bodyId) {
        agent.errorLine("Usage: /newsrpm body <bodyId> [--render]");
        return;
      }
      const res = flags.render ? await nrpm.renderBody(bodyId) : await nrpm.getBody(bodyId);
      const count = res?.body?.chunks?.length ?? 0;
      agent.infoLine(`Body chunks: ${count}`);
      await saveIfRequested(res);
    } else if (sub === 'upload') {
      const jsonPath = flags.json as string | undefined;
      if (!jsonPath) {
        agent.errorLine("Usage: /newsrpm upload --json <path>");
        return;
      }
      const fsService = agent.requireServiceByType(FileSystemService);
      const raw = await fsService.readTextFile(jsonPath, agent);
      if (raw) {
        const article = JSON.parse(raw);
        const res = await nrpm.uploadArticle(article);
        agent.infoLine(`Uploaded. id=${res?.id}`);
      } else {
        agent.errorLine(`Failed to read file: ${jsonPath}`);
      }
    } else {
      agent.infoLine("Unknown subcommand.");
      agent.infoLine(help);
    }
  } catch (e: any) {
    agent.errorLine(`NewsRPM command error: ${e?.message || String(e)}`);
  }
}


export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand