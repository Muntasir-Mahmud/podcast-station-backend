import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { podcasts } from './podcast.model';

export const episodes = sqliteTable('episodes', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	podcastId: text('podcast_id').references(() => podcasts.id),
	title: text('title', { length: 100 }).notNull(),
	description: text('description'),
	audioUrl: text('audio_url').notNull(),
	duration: integer('duration').notNull(),
	episodeNumber: integer('episode_number'),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
