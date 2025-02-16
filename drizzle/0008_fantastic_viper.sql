ALTER TABLE "usageLog" ALTER COLUMN "userName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "maxAmount" SET DEFAULT '0.5';