CREATE TABLE `study_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`question_id` integer,
	`occurred_at` integer NOT NULL,
	`received_at` integer NOT NULL,
	`path` text NOT NULL,
	`details` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `study_accounts`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_user_time` ON `study_events` (`user_id`,`received_at`);--> statement-breakpoint
CREATE INDEX `events_time` ON `study_events` (`received_at`);--> statement-breakpoint
CREATE INDEX `events_question` ON `study_events` (`question_id`);--> statement-breakpoint
ALTER TABLE `study_accounts` ADD `full_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `study_accounts` ADD `email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `study_accounts` ADD `consent_version` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `study_accounts` ADD `consent_at` integer;--> statement-breakpoint
ALTER TABLE `study_accounts` ADD `last_seen_at` integer;