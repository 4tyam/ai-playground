ALTER TABLE "usageLog" DROP CONSTRAINT "usageLog_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "usageLog" DROP CONSTRAINT "usageLog_messageId_message_id_fk";
--> statement-breakpoint
ALTER TABLE "usageLog" ADD COLUMN "userEmail" text NOT NULL;--> statement-breakpoint
ALTER TABLE "usageLog" ADD COLUMN "userName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "usageLog" ADD CONSTRAINT "usageLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usageLog" ADD CONSTRAINT "usageLog_messageId_message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."message"("id") ON DELETE set null ON UPDATE no action;