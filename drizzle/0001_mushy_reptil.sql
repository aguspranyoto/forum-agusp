CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`type` text NOT NULL,
	`post_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
