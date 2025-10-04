import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import NewsRPMService from "./NewsRPMService.js";
import packageJSON from './package.json' with {type: 'json'};
import * as tools from "./tools.ts";

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    agentTeam.addTools(packageInfo, tools);
    const config = agentTeam.getConfigSlice('newsrpm');
    if (config) {
      agentTeam.addServices(new NewsRPMService(config));
    }
  },
};

export * as chatCommands from "./chatCommands.ts";
export {default as NewsRPMService} from "./NewsRPMService.ts";
