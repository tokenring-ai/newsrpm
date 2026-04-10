import type TokenRingApp from "@tokenring-ai/app";
import {createRPCEndpoint} from "@tokenring-ai/rpc/createRPCEndpoint";
import NewsRPMService from "../NewsRPMService.ts";
import NewsRPMRpcSchema from "./schema.ts";

export default createRPCEndpoint(NewsRPMRpcSchema, {
  searchIndexedData(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).searchIndexedData(args);
  },

  searchArticles(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).searchArticles(args);
  },

  getArticleBySlug(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).getArticleBySlug(args.slug);
  },

  getBody(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).getBody(args.bodyId);
  },

  renderBody(args, app: TokenRingApp) {
    return app.requireService(NewsRPMService).renderBody(args.bodyId);
  },
});
