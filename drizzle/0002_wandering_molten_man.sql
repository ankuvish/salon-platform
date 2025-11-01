DROP TABLE `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` text NOT NULL,
	`salon_id` integer NOT NULL,
	`service_id` integer NOT NULL,
	`staff_id` integer NOT NULL,
	`booking_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`salon_id`) REFERENCES `salons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bookings`("id", "customer_id", "salon_id", "service_id", "staff_id", "booking_date", "start_time", "end_time", "status", "notes", "created_at") SELECT "id", "customer_id", "salon_id", "service_id", "staff_id", "booking_date", "start_time", "end_time", "status", "notes", "created_at" FROM `bookings`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
ALTER TABLE `__new_bookings` RENAME TO `bookings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`salon_id` integer NOT NULL,
	`customer_id` text NOT NULL,
	`booking_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`salon_id`) REFERENCES `salons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "salon_id", "customer_id", "booking_id", "rating", "comment", "created_at") SELECT "id", "salon_id", "customer_id", "booking_id", "rating", "comment", "created_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE TABLE `__new_salons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`phone` text NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`image_url` text,
	`opening_time` text NOT NULL,
	`closing_time` text NOT NULL,
	`salon_type` text DEFAULT 'unisex' NOT NULL,
	`gst_number` text,
	`is_verified` integer DEFAULT false NOT NULL,
	`verification_documents` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_salons`("id", "owner_id", "name", "description", "address", "city", "latitude", "longitude", "phone", "rating", "image_url", "opening_time", "closing_time", "salon_type", "gst_number", "is_verified", "verification_documents", "created_at") SELECT "id", "owner_id", "name", "description", "address", "city", "latitude", "longitude", "phone", "rating", "image_url", "opening_time", "closing_time", "salon_type", "gst_number", "is_verified", "verification_documents", "created_at" FROM `salons`;--> statement-breakpoint
DROP TABLE `salons`;--> statement-breakpoint
ALTER TABLE `__new_salons` RENAME TO `salons`;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `user` ADD `gender` text;