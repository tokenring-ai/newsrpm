import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {ScriptingService} from "@tokenring-ai/scripting";
import {ScriptingThis} from "@tokenring-ai/scripting/ScriptingService.ts";
import NewsRPMService, {NewsRPMConfigSchema} from "./NewsRPMService.js";
import packageJSON from './package.json' with {type: 'json'};
import * as tools from "./tools.ts";

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    agentTeam.services.waitForItemByType(ScriptingService).then((scriptingService: ScriptingService) => {
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
    agentTeam.addTools(packageInfo, tools);
    const config = agentTeam.getConfigSlice('newsrpm', NewsRPMConfigSchema);
    if (config) {
      agentTeam.addServices(new NewsRPMService(config));
    }
  },
};

export * as chatCommands from "./chatCommands.ts";
export {default as NewsRPMService} from "./NewsRPMService.ts";
