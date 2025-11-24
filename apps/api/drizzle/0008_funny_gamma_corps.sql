CREATE TABLE "user_dashboard_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"layout" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"collapsed_widgets" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_dashboard_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "widget_configuration" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"widget_type" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widget_configuration_user_widget_unique" UNIQUE("user_id","widget_type")
);
--> statement-breakpoint
ALTER TABLE "user_dashboard_preferences" ADD CONSTRAINT "user_dashboard_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_configuration" ADD CONSTRAINT "widget_configuration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_dashboard_preferences_user_id_idx" ON "user_dashboard_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "widget_configuration_user_id_idx" ON "widget_configuration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "widget_configuration_widget_type_idx" ON "widget_configuration" USING btree ("widget_type");