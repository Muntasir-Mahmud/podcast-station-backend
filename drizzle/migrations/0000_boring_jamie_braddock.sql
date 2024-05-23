CREATE TABLE `podcasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(100) NOT NULL,
	`description` text,
	`cover_image` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
