import TokenRingApp from "@tokenring-ai/app";
import {createRPCEndpoint} from "@tokenring-ai/rpc/createRPCEndpoint";
import NewsRPMService from "../NewsRPMService.ts";
import NewsRPMRpcSchema from "./schema.ts";

export default createRPCEndpoint(NewsRPMRpcSchema, {
  async searchIndexedData(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).searchIndexedData(args);
  },

  async searchArticles(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).searchArticles(args);
  },

  async getArticleBySlug(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).getArticleBySlug(args.slug);
  },

  async getBody(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).getBody(args.bodyId);
  },

  async renderBody(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).renderBody(args.bodyId);
  },
});
