import z from "zod";
import indexedDataRowSchema from "./indexedData.ts";
import metadataSchema from "./metaData.ts";
import normalizedDataSchema from "./normalizedData.ts";
import visibilitySchema from "./visibility.ts";

export default z.object({
  id: z.number().exactOptional(),
  slug: z.string(),
  providerCode: z.string().exactOptional(),
  provider: z.string(),
  publisher: z.string().exactOptional(),
  date: z.string(),
  expires: z.string().exactOptional().nullable(),
  updatedAt: z.string().exactOptional(),
  headline: z.string(),
  summary: z.string().exactOptional(),
  firstParagraph: z.string().exactOptional(),
  link: z.string().exactOptional(),
  bodyId: z.string().exactOptional(),
  metaData: metadataSchema.exactOptional(),
  normalizedData: normalizedDataSchema.default({}),
  language: z.string().default("en"),
  visiblity: visibilitySchema.default("published"), // Intentionally misspelled to match the database column
  quality: z.number().default(0),
  type: z.string(),
  sponsored: z.union([z.boolean(), z.number()]).default(false),
  indexedData: z.array(indexedDataRowSchema).default([]),
});
