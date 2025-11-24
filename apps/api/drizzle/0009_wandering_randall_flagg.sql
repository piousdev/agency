CREATE TYPE "public"."notification_entity_type" AS ENUM('ticket', 'project', 'comment', 'client', 'sprint', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('mention', 'comment', 'reply', 'assignment', 'unassignment', 'status_change', 'due_date_reminder', 'overdue', 'project_update', 'system');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_id" text NOT NULL,
	"sender_id" text,
	"type" "notification_type" NOT NULL,
	"entity_type" "notification_entity_type",
	"entity_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"read" boolean DEFAULT false NOT NULL,
	"snoozed_until" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_recipient_id_idx" ON "notification" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_read_idx" ON "notification" USING btree ("recipient_id","read");--> statement-breakpoint
CREATE INDEX "notification_sender_id_idx" ON "notification" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "notification_entity_idx" ON "notification" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_recipient_created_idx" ON "notification" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING brin ("created_at");