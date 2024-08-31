import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const podcasts = sqliteTable('podcasts', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	artist: text('artist', { length: 100 }),
	title: text('title', { length: 100 }).notNull(),
	description: text('description'),
	coverImage: text('cover_image'),
	audioUrl: text('audio_url'),
	favourite: integer('favourite', { mode: 'boolean' }),
	category: text('category', { enum: ['New release', 'favorite', 'general'] }),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
