import { z } from 'zod';

export const createMoodLogSchema = z.object({
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10).optional(),
  stress: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
});

export const updateMoodLogSchema = createMoodLogSchema.partial();

export type CreateMoodLogInput = z.infer<typeof createMoodLogSchema>;
export type UpdateMoodLogInput = z.infer<typeof updateMoodLogSchema>;
