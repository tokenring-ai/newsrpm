import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService";
import {z} from "zod";
import NewsRPMService, {NewsRPMConfigSchema} from "./NewsRPMService.ts";
import packageJSON from "./package.json";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  newsrpm: NewsRPMConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    app.services.waitForItemByType(ScriptingService, (scriptingService: ScriptingService) => {
      scriptingService.registerFunction("searchArticles", {
          type: 'native',
          params: ['query'],
          async execute(this: ScriptingThis, query: string): Promise<string> {
            const result = await this.agent.requireServiceByType(NewsRPMService).searchArticles({fullText: query});
            return JSON.stringify(result.rows);
          }
        }
      );

      scriptingService.registerFunction("searchIndexedData", {
          type: 'native',
          params: ['key', 'value'],
          async execute(this: ScriptingThis, key: string, value: string): Promise<string> {
            const result = await this.agent.requireServiceByType(NewsRPMService).searchIndexedData({key, value});
            return JSON.stringify(result.rows);
          }
        }
      );

      scriptingService.registerFunction("getArticleBySlug", {
          type: 'native',
          params: ['slug'],
          async execute(this: ScriptingThis, slug: string): Promise<string> {
            const result = await this.agent.requireServiceByType(NewsRPMService).getArticleBySlug(slug);
            return JSON.stringify(result.doc);
          }
        }
      );

      scriptingService.registerFunction("listProviders", {
          type: 'native',
          params: [],
          async execute(this: ScriptingThis,): Promise<string> {
            const result = await this.agent.requireServiceByType(NewsRPMService).listProviders();
            return JSON.stringify(result.rows);
          }
        }
      );
    });
    app.waitForService(ChatService, chatService =>
      chatService.addTools(packageJSON.name, tools)
    );
    // const config = app.getConfigSlice('newsrpm', NewsRPMConfigSchema);
    if (config.newsrpm) {
      app.addServices(new NewsRPMService(config.newsrpm));
    }
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;