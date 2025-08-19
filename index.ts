import packageJSON from './package.json' with {type: 'json'};

export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export * as chatCommands from "./chatCommands.ts";
export {default as NewsRPMService} from "./NewsRPMService.ts";
export * as tools from "./tools.ts";
