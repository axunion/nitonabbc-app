CREATE TABLE `bulletins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_date` text NOT NULL,
	`sections` text DEFAULT '[]' NOT NULL,
	`created_by` integer NOT NULL,
	`updated_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bulletins_service_date_unique` ON `bulletins` (`service_date`);--> statement-breakpoint
CREATE INDEX `idx_bulletins_service_date` ON `bulletins` (`service_date`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`line_user_id` text,
	`invite_token` text NOT NULL,
	`invite_used` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_line_user_id_unique` ON `users` (`line_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_invite_token_unique` ON `users` (`invite_token`);--> statement-breakpoint
CREATE INDEX `idx_users_line_user_id` ON `users` (`line_user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_invite_token` ON `users` (`invite_token`);