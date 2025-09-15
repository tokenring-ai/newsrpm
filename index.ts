import {TokenRingPackage} from "@tokenring-ai/agent";
import packageJSON from './package.json' with {type: 'json'};

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
};

export * as chatCommands from "./chatCommands.ts";
export {default as NewsRPMService} from "./NewsRPMService.ts";
export * as tools from "./tools.ts";
