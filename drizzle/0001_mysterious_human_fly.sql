CREATE TABLE `usernames` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usernames_user_id_unique` ON `usernames` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `usernames_username_unique` ON `usernames` (`username`);