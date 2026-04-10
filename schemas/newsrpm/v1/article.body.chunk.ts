import z from "zod";

export default z.object({
  format: z.string(),
  name: z.string().optional(),
  content: z.string(),
});
