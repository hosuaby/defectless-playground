import { z } from 'zod';

export const ZConfigSchema = z.object({
  debug: z.boolean(),
  value: z.number(),
});

export type ConfigSchema = z.infer<typeof ZConfigSchema>;
