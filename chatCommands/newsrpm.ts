import ChatService from "@token-ring/chat/ChatService";
import type { Registry } from "@token-ring/registry";
import { HumanInterfaceService } from "@token-ring/chat";
import { FileSystemService } from "@token-ring/filesystem";
import NewsRPMService from "../NewsRPMService.ts";

export const description = "/newsrpm [index|search|article|providers|body|upload] - Interact with NewsRPM";


export function help(): Array<string> {
    return [
        "/newsrpm [action] - Interact with NewsRPM service for news articles and data",
        "  Actions:",
        "    index <key> [options]     - Search indexed data by key",
        "    search [options]          - Search articles with filters",
        "    article slug <slug>       - Get article by slug",
        "    article id <id>           - Get article by ID",
        "    providers                 - List available providers",
        "    body <bodyId> [options]   - Get article body content",
        "    upload --json <path>      - Upload article from JSON file",
        "",
        "  Common Options:",
        "    --save <path>             - Save response to JSON file",
        "    --count <n>               - Limit number of results",
        "    --offset <n>              - Skip number of results",
        "    --min <iso>               - Minimum date (ISO format)",
        "    --max <iso>               - Maximum date (ISO format)",
        "",
        "  Examples:",
        "    /newsrpm search --fulltext \"AI\" --count 10",
        "    /newsrpm article slug \"my-article-slug\"",
        "    /newsrpm index publisher --value \"Reuters,BBC\"",
        "    /newsrpm providers --save providers.json",
    ];
}
function parseFlags(args: string[]): { flags: Record<string, string | number | boolean>; rest: string[] } {
  const flags: Record<string, string | number | boolean> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (["--value","--count","--offset","--min","--max","--order","--publisher","--provider","--type","--fulltext","--language","--json","--save"].includes(a)) {
      flags[a.slice(2)] = args[i+1]; i++; continue;
    }
    if (a === "--sponsored") { flags.sponsored = args[i+1] === 'true'; i++; continue; }
    if (a === "--render") { flags.render = true; continue; }
    if (a.startsWith("--")) { flags[a.slice(2)] = true; continue; }
    rest.push(a);
  }
  return { flags, rest };
}

export async function execute(remainder: string, registry: Registry): Promise<void> {
  const chat = registry.requireFirstServiceByType(ChatService);
  registry.requireFirstServiceByType(HumanInterfaceService);
  const nrpm = registry.requireFirstServiceByType(NewsRPMService);

  const [sub, ...rest] = remainder.trim().split(/\s+/);
  if (!sub) { help().forEach((l)=>chat.systemLine(l)); return; }
  const { flags, rest: r } = parseFlags(rest);

  const saveIfRequested = async (data: any) => {
    if (flags.save) {
      const fsService = registry.requireFirstServiceByType(FileSystemService);
      const path = String(flags.save);
      await fsService.writeFile(path, JSON.stringify(data, null, 2));
      chat.systemLine(`Saved raw JSON to ${path}`);
    }
  };

  try {
    if (sub === 'index') {
      const [key, ...restKey] = r;
      const keyArg = key;
      if (!keyArg) { chat.errorLine("Usage: /newsrpm index <key> [flags]"); return; }
      let value: string | string[] | undefined = flags.value as string | undefined;
      if (value && value.includes(',')) value = value.split(',').map(s=>s.trim()).filter(Boolean);
      const res = await nrpm.searchIndexedData({
        key: keyArg,
        value,
        count: flags.count ? Number(flags.count) : undefined,
        offset: flags.offset ? Number(flags.offset) : undefined,
        minDate: flags.min as string | undefined,
        maxDate: flags.max as string | undefined,
        order: (flags.order as any) || undefined,
      });
      const top = Array.isArray(res?.rows) ? res.rows.slice(0, 5) : [];
      if (top.length) {
        chat.systemLine("Top results:");
        for (const a of top) chat.systemLine(`- ${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`);
      } else {
        chat.systemLine("No results.");
      }
      await saveIfRequested(res);
    } else if (sub === 'search') {
      const rows = await nrpm.searchArticles({
        publisher: flags.publisher ? String(flags.publisher).split(',').map(s=>s.trim()).filter(Boolean) : undefined,
        provider: flags.provider ? String(flags.provider).split(',').map(s=>s.trim()).filter(Boolean) : undefined,
        type: flags.type ? String(flags.type).split(',').map(s=>s.trim()).filter(Boolean) : undefined,
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
        chat.systemLine("Top results:");
        for (const a of top) chat.systemLine(`- ${a.headline ?? '(no headline)'} [${a.provider ?? ''}] ${a.slug ?? ''}`);
      } else {
        chat.systemLine("No results.");
      }
      await saveIfRequested(rows);
    } else if (sub === 'article') {
      const which = r[0];
      if (which === 'slug') {
        const slug = r[1];
        if (!slug) { chat.errorLine("Usage: /newsrpm article slug <slug>"); return; }
        const res = await nrpm.getArticleBySlug(slug);
        chat.systemLine(res?.doc?.headline ?? "(no headline)");
        await saveIfRequested(res);
      } else if (which === 'id') {
        const id = Number(r[1]);
        if (!id) { chat.errorLine("Usage: /newsrpm article id <id>"); return; }
        const res = await nrpm.getArticleById(id);
        chat.systemLine(res?.doc?.headline ?? "(no headline)");
        await saveIfRequested(res);
      } else {
        chat.errorLine("Usage: /newsrpm article slug <slug> | id <id>");
      }
    } else if (sub === 'providers') {
      const res = await nrpm.listProviders();
      const providers = Array.isArray(res?.rows) ? res.rows.map((r:any)=>r.provider).filter(Boolean) : [];
      if (providers.length) {
        chat.systemLine("Providers:");
        for (const p of providers) chat.systemLine(`- ${p}`);
      } else chat.systemLine("No providers returned.");
      await saveIfRequested(res);
    } else if (sub === 'body') {
      const bodyId = r[0];
      if (!bodyId) { chat.errorLine("Usage: /newsrpm body <bodyId> [--render]"); return; }
      const res = flags.render ? await nrpm.renderBody(bodyId) : await nrpm.getBody(bodyId);
      const count = res?.body?.chunks?.length ?? 0;
      chat.systemLine(`Body chunks: ${count}`);
      await saveIfRequested(res);
    } else if (sub === 'upload') {
      const jsonPath = flags.json as string | undefined;
      if (!jsonPath) { chat.errorLine("Usage: /newsrpm upload --json <path>"); return; }
      const fsService = registry.requireFirstServiceByType(FileSystemService);
      const raw = await fsService.readFile(jsonPath, 'utf-8');
      const article = JSON.parse(raw);
      const res = await nrpm.uploadArticle(article);
      chat.systemLine(`Uploaded. id=${res?.id}`);
    } else {
      chat.systemLine("Unknown subcommand.");
      help().forEach((l)=>chat.systemLine(l));
    }
  } catch (e: any) {
    chat.errorLine(`NewsRPM command error: ${e?.message || String(e)}`);
  }
}
