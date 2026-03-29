import {z} from "zod";

const NewsRPMRpcSchema = {
  name: "NewsRPM RPC",
  path: "/rpc/newsrpm",
  methods: {
    searchIndexedData: {
      type: "query" as const,
      input: z.object({
        key: z.string(),
        value: z.union([z.string(), z.array(z.string())]).optional(),
        count: z.number().optional(),
        offset: z.number().optional(),
        minDate: z.string().optional(),
        maxDate: z.string().optional(),
        order: z.enum(["date", "dateWithQuality"]).optional(),
      }),
      result: z.object({
        success: z.boolean(),
        rows: z.array(z.any()),
      }),
    },
    searchArticles: {
      type: "query" as const,
      input: z.object({
        publisher: z.union([z.string(), z.array(z.string())]).optional(),
        provider: z.union([z.string(), z.array(z.string())]).optional(),
        fullText: z.string().optional(),
        type: z.union([z.string(), z.array(z.string())]).optional(),
        count: z.number().optional(),
        offset: z.number().optional(),
        minDate: z.string().optional(),
        maxDate: z.string().optional(),
        language: z.string().optional(),
      }),
      result: z.object({
        success: z.boolean(),
        rows: z.array(z.any()),
      }),
    },
    getArticleBySlug: {
      type: "query" as const,
      input: z.object({
        slug: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        doc: z.any(),
      }),
    },
    getBody: {
      type: "query" as const,
      input: z.object({
        bodyId: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        body: z.object({
          v: z.number(),
          chunks: z.array(z.object({
            name: z.string(),
            format: z.string(),
            content: z.string(),
          })),
        }).nullable(),
      }),
    },
    renderBody: {
      type: "query" as const,
      input: z.object({
        bodyId: z.string(),
      }),
      result: z.object({
        success: z.boolean(),
        body: z.object({
          v: z.number(),
          chunks: z.array(z.object({
            name: z.string(),
            format: z.string(),
            content: z.string(),
          })),
        }).nullable(),
      }),
    },
  },
};

export default NewsRPMRpcSchema;
