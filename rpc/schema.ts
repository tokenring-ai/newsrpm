import {z} from "zod";
import {
  ArticleBodyResponseSchema,
  ArticleSearchSchema,
  IndexedDataSearchSchema,
  MultipleArticleResponseSchema,
  SingleArticleResponseSchema
} from "../schema.ts";

const NewsRPMRpcSchema = {
  name: "NewsRPM RPC",
  path: "/rpc/newsrpm",
  methods: {
    searchIndexedData: {
      type: "query" as const,
      input: IndexedDataSearchSchema,
      result: MultipleArticleResponseSchema
    },
    searchArticles: {
      type: "query" as const,
      input: ArticleSearchSchema,
      result: MultipleArticleResponseSchema
    },
    getArticleBySlug: {
      type: "query" as const,
      input: z.object({
        slug: z.string(),
      }),
      result: SingleArticleResponseSchema
    },
    getBody: {
      type: "query" as const,
      input: z.object({
        bodyId: z.string(),
      }),
      result: ArticleBodyResponseSchema
    },
    renderBody: {
      type: "query" as const,
      input: z.object({
        bodyId: z.string(),
      }),
      result: ArticleBodyResponseSchema
    },
  },
};

export default NewsRPMRpcSchema;
