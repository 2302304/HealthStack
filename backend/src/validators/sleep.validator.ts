import { z } from 'zod';

export const createSleepLogSchema = z.object({
  sleepStart: z.string().datetime(),
  sleepEnd: z.string().datetime(),
  quality: z.number().min(1).max(10),
  notes: z.string().optional(),
});

export const updateSleepLogSchema = createSleepLogSchema.partial();

export type CreateSleepLogInput = z.infer<typeof createSleepLogSchema>;
export type UpdateSleepLogInput = z.infer<typeof updateSleepLogSchema>;
