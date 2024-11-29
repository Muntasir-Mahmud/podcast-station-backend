import { z } from 'zod';

export const createPodcastSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional()
});

export const updatePodcastSchema = createPodcastSchema.partial();

export const createEpisodeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  audioUrl: z.string().url(),
  duration: z.number().min(0),
  episodeNumber: z.number().optional()
});

export type CreatePodcastInput = z.infer<typeof createPodcastSchema>;
export type UpdatePodcastInput = z.infer<typeof updatePodcastSchema>;
export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
