CREATE TYPE "public"."sla_status" AS ENUM('on_track', 'at_risk', 'breached');--> statement-breakpoint
CREATE TYPE "public"."ticket_activity_type" AS ENUM('ticket_created', 'status_changed', 'priority_changed', 'assignee_changed', 'type_changed', 'comment_added', 'comment_edited', 'comment_deleted', 'file_uploaded', 'file_deleted', 'sla_updated', 'due_date_changed', 'tags_updated', 'linked_to_project', 'merged', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."ticket_source" AS ENUM('web_form', 'email', 'phone', 'chat', 'api', 'internal');--> statement-breakpoint
CREATE TABLE "ticket_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"type" "ticket_activity_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "ticket_number" varchar(20);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "source" "ticket_source" DEFAULT 'web_form' NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "sla_status" "sla_status" DEFAULT 'on_track';--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "due_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "first_response_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "first_response_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "estimated_time" integer;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "time_spent" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "contact_email" varchar(255);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "contact_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "environment" varchar(100);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "affected_url" varchar(2000);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "browser_info" varchar(500);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "parent_ticket_id" text;--> statement-breakpoint
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ticket_activity_ticket_id_idx" ON "ticket_activity" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_activity_actor_id_idx" ON "ticket_activity" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "ticket_activity_type_idx" ON "ticket_activity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ticket_activity_ticket_created_idx" ON "ticket_activity" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "ticket_activity_created_at_idx" ON "ticket_activity" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "ticket_parent_ticket_id_idx" ON "ticket" USING btree ("parent_ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_source_idx" ON "ticket" USING btree ("source");--> statement-breakpoint
CREATE INDEX "ticket_sla_status_idx" ON "ticket" USING btree ("sla_status");--> statement-breakpoint
CREATE INDEX "ticket_sla_due_idx" ON "ticket" USING btree ("sla_status","due_at");--> statement-breakpoint
CREATE INDEX "ticket_tags_idx" ON "ticket" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "ticket_due_at_idx" ON "ticket" USING brin ("due_at");--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ticket_number_unique" UNIQUE("ticket_number");