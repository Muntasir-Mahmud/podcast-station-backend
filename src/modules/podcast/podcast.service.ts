import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { Episode, episodes } from '../../models/episode.model';
import { Podcast, podcasts } from '../../models/podcast.model';
import { UploadService } from '../../services/uploadService';
import { CreateEpisodeInput, CreatePodcastInput, UpdatePodcastInput } from './podcast.schema';

export class PodcastService {
	constructor(private uploadService: UploadService, private D1: D1Database) {}

	async createPodcast(input: CreatePodcastInput, userId: string): Promise<Podcast> {
		const database = db(this.D1);

		const [podcast] = await database
			.insert(podcasts)
			.values({
				...input,
				authorId: userId,
			})
			.returning();

		return podcast;
	}

	async getPodcast(id: string): Promise<Podcast | null> {
		const database = db(this.D1);

		const podcast = await database.select().from(podcasts).where(eq(podcasts.id, id)).get();

		return podcast ?? null;
	}

	async updatePodcast(id: string, input: UpdatePodcastInput, userId: string): Promise<Podcast> {
		const database = db(this.D1);

		const podcast = await this.getPodcast(id);

		if (!podcast) {
			throw new Error('Podcast not found');
		}

		if (podcast.authorId !== userId) {
			throw new Error('Unauthorized');
		}

		const [updated] = await database.update(podcasts).set(input).where(eq(podcasts.id, id)).returning();

		return updated;
	}

	async deletePodcast(id: string, userId: string): Promise<void> {
		const database = db(this.D1);

		const podcast = await this.getPodcast(id);

		if (!podcast) {
			throw new Error('Podcast not found');
		}

		if (podcast.authorId !== userId) {
			throw new Error('Unauthorized');
		}

		await database.delete(podcasts).where(eq(podcasts.id, id));
	}

	async addEpisode(podcastId: string, input: CreateEpisodeInput, userId: string): Promise<Episode> {
		const database = db(this.D1);

		const podcast = await this.getPodcast(podcastId);

		if (!podcast) {
			throw new Error('Podcast not found');
		}

		if (podcast.authorId !== userId) {
			throw new Error('Unauthorized');
		}

		// Ensure all required properties are present
		const episodeData = {
			...input,
			podcastId,
			description: input.description ?? null,
			episodeNumber: input.episodeNumber ?? null,
		};

		const [episode] = await database.insert(episodes).values(episodeData).returning();

		// Update podcast stats with null coalescing
		await database
			.update(podcasts)
			.set({
				totalEpisodes: (podcast.totalEpisodes ?? 0) + 1,
				totalDuration: (podcast.totalDuration ?? 0) + input.duration,
			})
			.where(eq(podcasts.id, podcastId));

		return episode;
	}

	async getPodcastWithEpisodes(id: string): Promise<{ podcast: Podcast; episodes: Episode[] } | null> {
		const database = db(this.D1);

		const podcast = await this.getPodcast(id);
		if (!podcast) {
			return null;
		}

		const podcastEpisodes = await database.select().from(episodes).where(eq(episodes.podcastId, id)).all();

		return {
			podcast,
			episodes: podcastEpisodes,
		};
	}

	async getUploadUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; fileKey: string }> {
		return this.uploadService.getUploadUrl(fileName, fileType);
	}
}
