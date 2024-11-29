import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { episodes } from './episode.model';
import { users } from './user.model';

export const playlists = sqliteTable('playlists', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name', { length: 100 }).notNull(),
	description: text('description'),
	userId: text('user_id').references(() => users.id),
	isPublic: integer('is_public', { mode: 'boolean' }).default(false),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const playlistEpisodes = sqliteTable('playlist_episodes', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	playlistId: text('playlist_id').references(() => playlists.id),
	episodeId: text('episode_id').references(() => episodes.id),
	position: integer('position').notNull(),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistEpisode = typeof playlistEpisodes.$inferSelect;
export type NewPlaylistEpisode = typeof playlistEpisodes.$inferInsert;
