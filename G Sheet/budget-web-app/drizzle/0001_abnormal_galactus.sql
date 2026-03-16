CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`limit` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#3B82F6',
	`icon` varchar(64) NOT NULL DEFAULT 'tag',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_sheets_syncs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`spreadsheetId` varchar(256) NOT NULL,
	`sheetName` varchar(256) NOT NULL DEFAULT 'Budget',
	`lastSyncedAt` timestamp,
	`syncStatus` enum('idle','syncing','error') NOT NULL DEFAULT 'idle',
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_sheets_syncs_id` PRIMARY KEY(`id`),
	CONSTRAINT `google_sheets_syncs_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateName` varchar(128) NOT NULL,
	`amount` int NOT NULL,
	`categoryId` int NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','yearly') NOT NULL,
	`nextDueDate` timestamp NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`categoryId` int NOT NULL,
	`type` enum('expense','income') NOT NULL DEFAULT 'expense',
	`googleSheetsRowId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
