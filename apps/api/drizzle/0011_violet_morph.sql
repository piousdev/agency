CREATE TYPE "public"."confidence_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."request_stage" AS ENUM('in_treatment', 'on_hold', 'estimation', 'ready');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('bug', 'feature', 'enhancement', 'change_request', 'support', 'other');--> statement-breakpoint
CREATE TYPE "public"."request_history_action" AS ENUM('created', 'stage_changed', 'priority_changed', 'assigned_pm', 'assigned_estimator', 'estimated', 'converted', 'put_on_hold', 'resumed', 'cancelled', 'updated', 'attachment_added', 'attachment_removed', 'comment_added');--> statement-breakpoint
CREATE TABLE "request" (
	"id" text PRIMARY KEY NOT NULL,
	"request_number" varchar(20),
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"type" "request_type" NOT NULL,
	"stage" "request_stage" DEFAULT 'in_treatment' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"stage_entered_at" timestamp DEFAULT now() NOT NULL,
	"business_justification" text,
	"desired_delivery_date" timestamp,
	"steps_to_reproduce" text,
	"dependencies" text,
	"additional_notes" text,
	"story_points" integer,
	"confidence" "confidence_level",
	"estimation_notes" text,
	"estimated_at" timestamp,
	"hold_reason" text,
	"hold_started_at" timestamp,
	"converted_to_type" varchar(20),
	"converted_to_id" text,
	"converted_at" timestamp,
	"is_converted" boolean DEFAULT false NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"cancelled_reason" text,
	"cancelled_at" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"requester_id" text NOT NULL,
	"assigned_pm_id" text,
	"estimator_id" text,
	"client_id" text,
	"related_project_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "request_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "request_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"file_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request_history" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" "request_history_action" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_assigned_pm_id_user_id_fk" FOREIGN KEY ("assigned_pm_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_estimator_id_user_id_fk" FOREIGN KEY ("estimator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_related_project_id_project_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_attachment" ADD CONSTRAINT "request_attachment_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_attachment" ADD CONSTRAINT "request_attachment_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "request_requester_id_idx" ON "request" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "request_assigned_pm_id_idx" ON "request" USING btree ("assigned_pm_id");--> statement-breakpoint
CREATE INDEX "request_estimator_id_idx" ON "request" USING btree ("estimator_id");--> statement-breakpoint
CREATE INDEX "request_client_id_idx" ON "request" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "request_related_project_id_idx" ON "request" USING btree ("related_project_id");--> statement-breakpoint
CREATE INDEX "request_type_idx" ON "request" USING btree ("type");--> statement-breakpoint
CREATE INDEX "request_stage_idx" ON "request" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "request_priority_idx" ON "request" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "request_stage_priority_idx" ON "request" USING btree ("stage","priority");--> statement-breakpoint
CREATE INDEX "request_stage_created_idx" ON "request" USING btree ("stage","created_at");--> statement-breakpoint
CREATE INDEX "request_stage_entered_idx" ON "request" USING btree ("stage","stage_entered_at");--> statement-breakpoint
CREATE INDEX "request_stage_age_idx" ON "request" USING btree ("stage","stage_entered_at","priority");--> statement-breakpoint
CREATE INDEX "request_status_idx" ON "request" USING btree ("is_converted","is_cancelled");--> statement-breakpoint
CREATE INDEX "request_search_idx" ON "request" USING gin (to_tsvector('english', "title" || ' ' || "description"));--> statement-breakpoint
CREATE INDEX "request_tags_idx" ON "request" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "request_created_at_idx" ON "request" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "request_updated_at_idx" ON "request" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "request_stage_entered_at_idx" ON "request" USING brin ("stage_entered_at");--> statement-breakpoint
CREATE INDEX "request_attachment_request_id_idx" ON "request_attachment" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_attachment_file_id_idx" ON "request_attachment" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "request_history_request_id_idx" ON "request_history" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_history_actor_id_idx" ON "request_history" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "request_history_action_idx" ON "request_history" USING btree ("action");--> statement-breakpoint
CREATE INDEX "request_history_request_created_idx" ON "request_history" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE INDEX "request_history_created_at_idx" ON "request_history" USING brin ("created_at");