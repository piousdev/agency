CREATE TYPE "public"."entity_type" AS ENUM('project', 'ticket', 'client');--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'created' BEFORE 'project_created';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'updated' BEFORE 'project_created';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'deleted' BEFORE 'project_created';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'restored' BEFORE 'project_created';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'archived' BEFORE 'project_created';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'assigned';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'unassigned';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'bulk_status_changed';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'bulk_assigned';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'bulk_deleted';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'field_changed';--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "entity_type" "entity_type";--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "entity_id" text;--> statement-breakpoint
CREATE INDEX "activity_entity_type_idx" ON "activity" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "activity_entity_id_idx" ON "activity" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "activity_entity_type_entity_id_idx" ON "activity" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_entity_created_idx" ON "activity" USING btree ("entity_type","entity_id","created_at");