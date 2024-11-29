import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { users } from './user.model';

export const podcasts = sqliteTable('podcasts', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title', { length: 100 }).notNull(),
	description: text('description'),
	artist: text('artist', { length: 100 }),
	coverImage: text('cover_image'),
	audioUrl: text('audio_url'),
	favourite: integer('favourite', { mode: 'boolean' }),
	category: text('category', { enum: ['New release', 'favorite', 'general'] }),
	authorId: text('author_id').references(() => users.id),
	totalEpisodes: integer('total_episodes').default(0),
	totalDuration: integer('total_duration').default(0),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export type Podcast = typeof podcasts.$inferSelect;
export type NewPodcast = typeof podcasts.$inferInsert;
