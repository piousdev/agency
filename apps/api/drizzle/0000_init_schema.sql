CREATE TYPE "public"."client_type" AS ENUM('creative', 'software', 'full_service', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in_development', 'in_review', 'delivered', 'maintenance', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'pending_client', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('intake', 'bug', 'support', 'incident', 'change_request');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'client');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(100) NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "client_type" DEFAULT 'creative' NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"website" varchar(2048),
	"address" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_email_unique" UNIQUE("email"),
	CONSTRAINT "client_email_check" CHECK ("client"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"ticket_id" text,
	"project_id" text,
	"author_id" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(1024) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size" integer NOT NULL,
	"project_id" text,
	"ticket_id" text,
	"comment_id" text,
	"uploaded_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_key_unique" UNIQUE("key"),
	CONSTRAINT "file_size_check" CHECK ("file"."size" > 0)
);
--> statement-breakpoint
CREATE TABLE "file_upload_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"key" varchar(1024) NOT NULL,
	"uploaded_by_id" text NOT NULL,
	"status" "upload_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "file_upload_tracking_key_unique" UNIQUE("key"),
	CONSTRAINT "file_upload_tracking_confirmed_after_created" CHECK ("file_upload_tracking"."confirmed_at" IS NULL OR "file_upload_tracking"."confirmed_at" >= "file_upload_tracking"."created_at"),
	CONSTRAINT "file_upload_tracking_expires_after_created" CHECK ("file_upload_tracking"."expires_at" > "file_upload_tracking"."created_at")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"token" varchar(512) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"client_id" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'in_development' NOT NULL,
	"client_id" text NOT NULL,
	"repository_url" varchar(2048),
	"production_url" varchar(2048),
	"staging_url" varchar(2048),
	"notes" text,
	"started_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"role_type" varchar(50) DEFAULT 'internal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by_id" text,
	CONSTRAINT "role_assignment_user_role_unique" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"type" "ticket_type" NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"project_id" text,
	"client_id" text NOT NULL,
	"created_by_id" text NOT NULL,
	"assigned_to_id" text,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_email_check" CHECK ("user"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "user_to_client" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"client_id" text NOT NULL,
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_to_client_user_client_unique" UNIQUE("user_id","client_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(512) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_upload_tracking" ADD CONSTRAINT "file_upload_tracking_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_assigned_by_id_user_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assigned_to_id_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_client" ADD CONSTRAINT "user_to_client_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_client" ADD CONSTRAINT "user_to_client_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_user_provider_idx" ON "account" USING btree ("user_id","provider_id");--> statement-breakpoint
CREATE INDEX "account_provider_id_idx" ON "account" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "account_created_at_idx" ON "account" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "account_updated_at_idx" ON "account" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "client_type_idx" ON "client" USING btree ("type");--> statement-breakpoint
CREATE INDEX "client_active_idx" ON "client" USING btree ("active");--> statement-breakpoint
CREATE INDEX "client_active_type_idx" ON "client" USING btree ("active","type");--> statement-breakpoint
CREATE INDEX "client_created_at_idx" ON "client" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "client_updated_at_idx" ON "client" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "comment_ticket_id_idx" ON "comment" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "comment_project_id_idx" ON "comment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "comment_author_id_idx" ON "comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comment_is_internal_idx" ON "comment" USING btree ("is_internal");--> statement-breakpoint
CREATE INDEX "comment_ticket_internal_idx" ON "comment" USING btree ("ticket_id","is_internal");--> statement-breakpoint
CREATE INDEX "comment_search_idx" ON "comment" USING gin (to_tsvector('english', "content"));--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comment" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "comment_updated_at_idx" ON "comment" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "file_project_id_idx" ON "file" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "file_ticket_id_idx" ON "file" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "file_comment_id_idx" ON "file" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "file_uploaded_by_id_idx" ON "file" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "file_mime_type_idx" ON "file" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "file_created_at_idx" ON "file" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "file_upload_tracking_key_idx" ON "file_upload_tracking" USING btree ("key");--> statement-breakpoint
CREATE INDEX "file_upload_tracking_uploaded_by_id_idx" ON "file_upload_tracking" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "file_upload_tracking_cleanup_idx" ON "file_upload_tracking" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "file_upload_tracking_created_at_idx" ON "file_upload_tracking" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_created_by_id_idx" ON "invitation" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "invitation_client_id_idx" ON "invitation" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_valid_idx" ON "invitation" USING btree ("used","expires_at");--> statement-breakpoint
CREATE INDEX "invitation_created_at_idx" ON "invitation" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_updated_at_idx" ON "invitation" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "project_client_id_idx" ON "project" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_client_status_idx" ON "project" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "project_created_at_idx" ON "project" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "project_updated_at_idx" ON "project" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "project_started_at_idx" ON "project" USING brin ("started_at");--> statement-breakpoint
CREATE INDEX "project_delivered_at_idx" ON "project" USING brin ("delivered_at");--> statement-breakpoint
CREATE INDEX "role_type_idx" ON "role" USING btree ("role_type");--> statement-breakpoint
CREATE INDEX "role_created_at_idx" ON "role" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "role_updated_at_idx" ON "role" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "role_assignment_user_id_idx" ON "role_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_assignment_role_id_idx" ON "role_assignment" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_assignment_assigned_by_id_idx" ON "role_assignment" USING btree ("assigned_by_id");--> statement-breakpoint
CREATE INDEX "role_assignment_assigned_at_idx" ON "role_assignment" USING brin ("assigned_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_created_at_idx" ON "session" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "session_updated_at_idx" ON "session" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "ticket_project_id_idx" ON "ticket" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "ticket_client_id_idx" ON "ticket" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "ticket_created_by_id_idx" ON "ticket" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "ticket_assigned_to_id_idx" ON "ticket" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "ticket_type_idx" ON "ticket" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "ticket" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_priority_idx" ON "ticket" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ticket_client_status_idx" ON "ticket" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "ticket_assigned_status_idx" ON "ticket" USING btree ("assigned_to_id","status");--> statement-breakpoint
CREATE INDEX "ticket_status_priority_idx" ON "ticket" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX "ticket_search_idx" ON "ticket" USING gin (to_tsvector('english', "title" || ' ' || "description"));--> statement-breakpoint
CREATE INDEX "ticket_created_at_idx" ON "ticket" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "ticket_updated_at_idx" ON "ticket" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "ticket_resolved_at_idx" ON "ticket" USING brin ("resolved_at");--> statement-breakpoint
CREATE INDEX "ticket_closed_at_idx" ON "ticket" USING brin ("closed_at");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_is_internal_idx" ON "user" USING btree ("is_internal");--> statement-breakpoint
CREATE INDEX "user_expires_at_idx" ON "user" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "user_updated_at_idx" ON "user" USING brin ("updated_at");--> statement-breakpoint
CREATE INDEX "user_to_client_user_id_idx" ON "user_to_client" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_to_client_client_id_idx" ON "user_to_client" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "user_to_client_is_primary_contact_idx" ON "user_to_client" USING btree ("is_primary_contact");--> statement-breakpoint
CREATE INDEX "user_to_client_created_at_idx" ON "user_to_client" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_identifier_value_idx" ON "verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_created_at_idx" ON "verification" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "verification_updated_at_idx" ON "verification" USING brin ("updated_at");