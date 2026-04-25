CREATE TABLE `campaign_product_limit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`campaign_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`delta` integer NOT NULL,
	`prev_limit` integer,
	`new_limit` integer,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `campaign_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_limit_logs_product` ON `campaign_product_limit_logs` (`product_id`);
--> statement-breakpoint
CREATE INDEX `idx_limit_logs_campaign` ON `campaign_product_limit_logs` (`campaign_id`);
