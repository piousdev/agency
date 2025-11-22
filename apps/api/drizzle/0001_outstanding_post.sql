CREATE TABLE "project_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text,
	"count" integer,
	"last_request" bigint
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "completion_percentage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "capacity_percentage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_assignment_project_id_idx" ON "project_assignment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_assignment_user_id_idx" ON "project_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_assignment_project_user_idx" ON "project_assignment" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "user_capacity_percentage_idx" ON "user" USING btree ("capacity_percentage");--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_completion_percentage_check" CHECK ("project"."completion_percentage" >= 0 AND "project"."completion_percentage" <= 100);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_capacity_percentage_check" CHECK ("user"."capacity_percentage" >= 0 AND "user"."capacity_percentage" <= 200);