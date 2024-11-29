import { drizzle } from 'drizzle-orm/d1';
import * as episodeSchema from './models/episode.model';
import * as playlistSchema from './models/playlist.model';
import * as podcastSchema from './models/podcast.model';
import * as userSchema from './models/user.model';

// Create Drizzle database instance with all schemas
export const db = (D1: D1Database) =>
	drizzle(D1, {
		schema: {
			...userSchema,
			...podcastSchema,
			...episodeSchema,
			...playlistSchema,
		},
	});
