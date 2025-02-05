ALTER TABLE "usageLog" ALTER COLUMN "totalCost" SET DATA TYPE numeric(25, 20);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "usageAmount" SET DATA TYPE numeric(25, 20);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "usageAmount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "maxAmount" SET DATA TYPE numeric(25, 20);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "maxAmount" SET DEFAULT '0';