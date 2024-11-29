CREATE TABLE `episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`podcast_id` text,
	`title` text(100) NOT NULL,
	`description` text,
	`audio_url` text NOT NULL,
	`duration` integer NOT NULL,
	`episode_number` integer,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `playlist_episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` text,
	`episode_id` text,
	`position` integer NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`description` text,
	`user_id` text,
	`is_public` integer DEFAULT false,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `podcasts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text(100) NOT NULL,
	`description` text,
	`artist` text(100),
	`cover_image` text,
	`audio_url` text,
	`favourite` integer,
	`category` text,
	`author_id` text,
	`total_episodes` integer DEFAULT 0,
	`total_duration` integer DEFAULT 0,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text(50) NOT NULL,
	`email` text(255) NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text(100),
	`profile_picture_url` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);