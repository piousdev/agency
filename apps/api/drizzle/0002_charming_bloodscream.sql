ALTER TYPE "public"."project_status" ADD VALUE 'proposal' BEFORE 'in_development';--> statement-breakpoint
ALTER TYPE "public"."project_status" ADD VALUE 'on_hold' BEFORE 'maintenance';