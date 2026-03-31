import z from "zod";

export default z.record(z.string(), z.any());