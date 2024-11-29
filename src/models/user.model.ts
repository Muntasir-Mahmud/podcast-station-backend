import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	username: text('username', { length: 50 }).notNull().unique(),
	email: text('email', { length: 255 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name', { length: 100 }),
	profilePictureUrl: text('profile_picture_url'),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
