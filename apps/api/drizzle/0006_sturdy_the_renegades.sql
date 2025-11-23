CREATE TYPE "public"."client_industry" AS ENUM('technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'media', 'real_estate', 'hospitality', 'nonprofit', 'government', 'professional_services', 'other');--> statement-breakpoint
CREATE TYPE "public"."client_size" AS ENUM('startup', 'small', 'medium', 'large', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."contact_role" AS ENUM('primary', 'billing', 'technical', 'executive', 'stakeholder', 'other');--> statement-breakpoint
CREATE TYPE "public"."label_scope" AS ENUM('global', 'project', 'ticket');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'missed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('private', 'team', 'client', 'public');--> statement-breakpoint
CREATE TYPE "public"."sla_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."sprint_status" AS ENUM('planning', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ticket_resolution" AS ENUM('fixed', 'wont_fix', 'duplicate', 'cannot_reproduce', 'not_a_bug', 'done', 'incomplete', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."ticket_type" ADD VALUE 'feature_request';--> statement-breakpoint
ALTER TYPE "public"."ticket_type" ADD VALUE 'task';--> statement-breakpoint
ALTER TYPE "public"."ticket_type" ADD VALUE 'story';--> statement-breakpoint
ALTER TYPE "public"."ticket_type" ADD VALUE 'epic';--> statement-breakpoint
CREATE TABLE "checklist" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text,
	"project_id" text,
	"title" text DEFAULT 'Checklist' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"checklist_id" text NOT NULL,
	"content" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"completed_by_id" text,
	"assignee_id" text,
	"due_date" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"mobile" varchar(50),
	"role" "contact_role" DEFAULT 'stakeholder' NOT NULL,
	"job_title" varchar(100),
	"department" varchar(100),
	"preferred_contact_method" varchar(20),
	"timezone" varchar(50),
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "label" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(7) DEFAULT '#6B7280' NOT NULL,
	"description" text,
	"scope" "label_scope" DEFAULT 'global' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_label" (
	"project_id" text NOT NULL,
	"label_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_label_project_id_label_id_pk" PRIMARY KEY("project_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_label" (
	"ticket_id" text NOT NULL,
	"label_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_label_ticket_id_label_id_pk" PRIMARY KEY("ticket_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "milestone" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprint" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"status" "sprint_status" DEFAULT 'planning' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"planned_points" integer DEFAULT 0,
	"completed_points" integer DEFAULT 0,
	"sprint_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_watcher" (
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_watcher_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_watcher" (
	"ticket_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_watcher_ticket_id_user_id_pk" PRIMARY KEY("ticket_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "industry" "client_industry";--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "company_size" "client_size";--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "logo" varchar(2048);--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "timezone" varchar(50);--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "preferred_language" varchar(10);--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "sla_tier" "sla_tier" DEFAULT 'silver';--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "contract_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "contract_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "annual_value" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "currency" varchar(3) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "billing_email" varchar(255);--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "color" varchar(7);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "icon" varchar(50);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "visibility" "project_visibility" DEFAULT 'team' NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "is_template" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "goals" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "resolution" "ticket_resolution";--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "story_points" integer;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "sprint_id" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "affected_version" varchar(50);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "fix_version" varchar(50);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "component" varchar(100);--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "is_internal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "acceptance_criteria" text;--> statement-breakpoint
ALTER TABLE "checklist" ADD CONSTRAINT "checklist_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist" ADD CONSTRAINT "checklist_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_checklist_id_checklist_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."checklist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_completed_by_id_user_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_label" ADD CONSTRAINT "project_label_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_label" ADD CONSTRAINT "project_label_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_label" ADD CONSTRAINT "ticket_label_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_label" ADD CONSTRAINT "ticket_label_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint" ADD CONSTRAINT "sprint_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_watcher" ADD CONSTRAINT "project_watcher_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_watcher" ADD CONSTRAINT "project_watcher_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_watcher" ADD CONSTRAINT "ticket_watcher_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_watcher" ADD CONSTRAINT "ticket_watcher_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_ticket_id_idx" ON "checklist" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "checklist_project_id_idx" ON "checklist" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "checklist_item_checklist_id_idx" ON "checklist_item" USING btree ("checklist_id");--> statement-breakpoint
CREATE INDEX "checklist_item_completed_idx" ON "checklist_item" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "checklist_item_assignee_id_idx" ON "checklist_item" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "checklist_item_sort_idx" ON "checklist_item" USING btree ("checklist_id","sort_order");--> statement-breakpoint
CREATE INDEX "client_contact_client_id_idx" ON "client_contact" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_contact_email_idx" ON "client_contact" USING btree ("email");--> statement-breakpoint
CREATE INDEX "client_contact_role_idx" ON "client_contact" USING btree ("role");--> statement-breakpoint
CREATE INDEX "client_contact_active_idx" ON "client_contact" USING btree ("active");--> statement-breakpoint
CREATE INDEX "client_contact_primary_idx" ON "client_contact" USING btree ("client_id","is_primary");--> statement-breakpoint
CREATE INDEX "label_scope_idx" ON "label" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "label_name_idx" ON "label" USING btree ("name");--> statement-breakpoint
CREATE INDEX "project_label_project_id_idx" ON "project_label" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_label_label_id_idx" ON "project_label" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "ticket_label_ticket_id_idx" ON "ticket_label" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_label_label_id_idx" ON "ticket_label" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "milestone_project_id_idx" ON "milestone" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "milestone_status_idx" ON "milestone" USING btree ("status");--> statement-breakpoint
CREATE INDEX "milestone_due_date_idx" ON "milestone" USING brin ("due_date");--> statement-breakpoint
CREATE INDEX "milestone_project_sort_idx" ON "milestone" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "sprint_project_id_idx" ON "sprint" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sprint_status_idx" ON "sprint" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sprint_start_date_idx" ON "sprint" USING brin ("start_date");--> statement-breakpoint
CREATE INDEX "sprint_end_date_idx" ON "sprint" USING brin ("end_date");--> statement-breakpoint
CREATE INDEX "sprint_project_number_idx" ON "sprint" USING btree ("project_id","sprint_number");--> statement-breakpoint
CREATE INDEX "project_watcher_project_id_idx" ON "project_watcher" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_watcher_user_id_idx" ON "project_watcher" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_watcher_ticket_id_idx" ON "ticket_watcher" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_watcher_user_id_idx" ON "ticket_watcher" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_industry_idx" ON "client" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "client_company_size_idx" ON "client" USING btree ("company_size");--> statement-breakpoint
CREATE INDEX "client_sla_tier_idx" ON "client" USING btree ("sla_tier");--> statement-breakpoint
CREATE INDEX "client_contract_dates_idx" ON "client" USING btree ("contract_start_date","contract_end_date");--> statement-breakpoint
CREATE INDEX "client_tags_idx" ON "client" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "project_visibility_idx" ON "project" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "project_is_template_idx" ON "project" USING btree ("is_template");--> statement-breakpoint
CREATE INDEX "project_owner_id_idx" ON "project" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "ticket_resolution_idx" ON "ticket" USING btree ("resolution");--> statement-breakpoint
CREATE INDEX "ticket_sprint_id_idx" ON "ticket" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "ticket_component_idx" ON "ticket" USING btree ("component");--> statement-breakpoint
CREATE INDEX "ticket_is_internal_idx" ON "ticket" USING btree ("is_internal");