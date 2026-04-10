import z from "zod";
import indexedDataRowSchema from "./indexedData.ts";
import metadataSchema from "./metaData.ts";
import normalizedDataSchema from "./normalizedData.ts";
import visibilitySchema from "./visibility.ts";

export default z.object({
  id: z.number().optional(),
  slug: z.string(),
  providerCode: z.string().optional(),
  provider: z.string(),
  publisher: z.string().optional(),
  date: z.string(),
  expires: z.string().optional().nullable(),
  updatedAt: z.string().optional(),
  headline: z.string(),
  summary: z.string().optional(),
  firstParagraph: z.string().optional(),
  link: z.string().optional(),
  bodyId: z.string().optional(),
  metaData: metadataSchema.optional(),
  normalizedData: normalizedDataSchema.default({}),
  language: z.string().default("en"),
  visiblity: visibilitySchema.default("published"), // Intentionally misspelled to match the database column
  quality: z.number().default(0),
  type: z.string(),
  sponsored: z.union([z.boolean(), z.number()]).default(false),
  indexedData: z.array(indexedDataRowSchema).default([]),
});
