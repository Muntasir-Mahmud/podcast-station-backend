import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const podcasts = sqliteTable('podcasts', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	title: text('title', { length: 100 }).notNull(),
	description: text('description'),
	coverImage: text('cover_image'),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
