CREATE TABLE IF NOT EXISTS "onboarding_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" "user_role" NOT NULL,
	"current_step" integer DEFAULT 1,
	"identity_fork" text,
	"domain_calibration" text,
	"workflow_sync" text,
	"provider_capabilities" text,
	"provider_verification" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "onboarding_submissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role" varchar(50) DEFAULT 'explorer' NOT NULL,
	"organization" varchar(255),
	"notes" text,
	"queue_number" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE IF EXISTS "affiliate_stores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "bookings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "build_pipelines" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "cart_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "carts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "community_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "component_applications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "component_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "component_comparisons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "component_subcategories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "components" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "forum_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "forum_replies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "forum_threads" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "group_buying_campaigns" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "group_buying_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "mentorship_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "order_tracking" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "orders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "pipeline_executions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "post_replies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "project_assets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "project_boms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "project_completions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "project_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "quotes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "wishlists" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "affiliate_stores" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "bookings" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "build_pipelines" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "cart_items" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "carts" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "community_posts" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "component_applications" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "component_categories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "component_comparisons" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "component_subcategories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "components" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "forum_categories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "forum_replies" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "forum_threads" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "group_buying_campaigns" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "group_buying_participants" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "mentorship_requests" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "messages" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "order_tracking" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "orders" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "pipeline_executions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "post_replies" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "project_assets" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "project_boms" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "project_completions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "project_likes" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "projects" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "quotes" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "reviews" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "wishlists" CASCADE;--> statement-breakpoint
ALTER TABLE IF EXISTS "profiles" DROP CONSTRAINT IF EXISTS "profiles_username_unique";--> statement-breakpoint
ALTER TABLE IF EXISTS "transactions" DROP CONSTRAINT IF EXISTS "transactions_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE IF EXISTS "transactions" DROP CONSTRAINT IF EXISTS "transactions_quote_id_quotes_id_fk";
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_submissions_user_id_users_id_fk') THEN
    ALTER TABLE "onboarding_submissions" ADD CONSTRAINT "onboarding_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE IF EXISTS "profiles" DROP COLUMN IF EXISTS "username";--> statement-breakpoint
ALTER TABLE IF EXISTS "transactions" DROP COLUMN IF EXISTS "order_id";--> statement-breakpoint
ALTER TABLE IF EXISTS "transactions" DROP COLUMN IF EXISTS "quote_id";--> statement-breakpoint
ALTER TABLE IF EXISTS "users" DROP COLUMN IF EXISTS "provider_approved";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."booking_status";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."component_type";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."group_buying_status";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."mentorship_status";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."order_status";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."project_visibility";