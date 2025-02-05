CREATE TABLE "usageLog" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"messageId" text NOT NULL,
	"model" text NOT NULL,
	"promptTokens" integer NOT NULL,
	"completionTokens" integer NOT NULL,
	"totalCost" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "usageAmount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "maxAmount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usageLog" ADD CONSTRAINT "usageLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usageLog" ADD CONSTRAINT "usageLog_messageId_message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;