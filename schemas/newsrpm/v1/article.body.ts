import z from "zod";
import articleBodyChunk from "./article.body.chunk.ts";

export default z.object({
  v: z.number(),
  chunks: z.array(articleBodyChunk),
});
