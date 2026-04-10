import z from "zod";

export default z.object({
  key: z.string(),
  value: z.string(),
});
