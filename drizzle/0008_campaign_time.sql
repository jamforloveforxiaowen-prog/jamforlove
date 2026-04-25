ALTER TABLE `campaigns` ADD `start_time` text DEFAULT '00:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `end_time` text DEFAULT '23:59' NOT NULL;
