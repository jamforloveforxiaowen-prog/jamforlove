ALTER TABLE `campaigns` ADD `supporter_discount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `fundraise_orders` ADD `is_supporter` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `fundraise_orders` ADD `discount_amount` integer DEFAULT 0 NOT NULL;
