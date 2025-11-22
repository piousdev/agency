CREATE TYPE "public"."project_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('project_created', 'project_updated', 'status_changed', 'assignee_added', 'assignee_removed', 'comment_added', 'file_uploaded', 'file_deleted', 'priority_changed', 'due_date_changed');--> statement-breakpoint
CREATE TABLE "activity" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"type" "activity_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "priority" "project_priority" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "estimated_hours" integer;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "actual_hours" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "budget_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "budget_currency" varchar(3) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_project_id_idx" ON "activity" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_actor_id_idx" ON "activity" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "activity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_project_created_idx" ON "activity" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_created_at_idx" ON "activity" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "project_priority_idx" ON "project" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "project_due_date_idx" ON "project" USING brin ("due_date");