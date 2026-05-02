ALTER TABLE "affiliate_stores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_comment_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_comments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_files" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_post_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bookings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "build_pipelines" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cart_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "community_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "component_applications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "component_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "component_comparisons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "component_subcategories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "components" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_replies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_threads" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_buying_campaigns" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "group_buying_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mentorship_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_tracking" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pipeline_executions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post_replies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_assets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_boms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_completions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "wishlists" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "affiliate_stores" CASCADE;--> statement-breakpoint
DROP TABLE "blog_comment_likes" CASCADE;--> statement-breakpoint
DROP TABLE "blog_comments" CASCADE;--> statement-breakpoint
DROP TABLE "blog_files" CASCADE;--> statement-breakpoint
DROP TABLE "blog_post_likes" CASCADE;--> statement-breakpoint
DROP TABLE "blog_posts" CASCADE;--> statement-breakpoint
DROP TABLE "bookings" CASCADE;--> statement-breakpoint
DROP TABLE "build_pipelines" CASCADE;--> statement-breakpoint
DROP TABLE "cart_items" CASCADE;--> statement-breakpoint
DROP TABLE "carts" CASCADE;--> statement-breakpoint
DROP TABLE "community_posts" CASCADE;--> statement-breakpoint
DROP TABLE "component_applications" CASCADE;--> statement-breakpoint
DROP TABLE "component_categories" CASCADE;--> statement-breakpoint
DROP TABLE "component_comparisons" CASCADE;--> statement-breakpoint
DROP TABLE "component_subcategories" CASCADE;--> statement-breakpoint
DROP TABLE "components" CASCADE;--> statement-breakpoint
DROP TABLE "forum_categories" CASCADE;--> statement-breakpoint
DROP TABLE "forum_replies" CASCADE;--> statement-breakpoint
DROP TABLE "forum_threads" CASCADE;--> statement-breakpoint
DROP TABLE "group_buying_campaigns" CASCADE;--> statement-breakpoint
DROP TABLE "group_buying_participants" CASCADE;--> statement-breakpoint
DROP TABLE "mentorship_requests" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
DROP TABLE "order_tracking" CASCADE;--> statement-breakpoint
DROP TABLE "orders" CASCADE;--> statement-breakpoint
DROP TABLE "pipeline_executions" CASCADE;--> statement-breakpoint
DROP TABLE "post_replies" CASCADE;--> statement-breakpoint
DROP TABLE "project_assets" CASCADE;--> statement-breakpoint
DROP TABLE "project_boms" CASCADE;--> statement-breakpoint
DROP TABLE "project_completions" CASCADE;--> statement-breakpoint
DROP TABLE "project_likes" CASCADE;--> statement-breakpoint
DROP TABLE "projects" CASCADE;--> statement-breakpoint
DROP TABLE "quotes" CASCADE;--> statement-breakpoint
DROP TABLE "reviews" CASCADE;--> statement-breakpoint
DROP TABLE "wishlists" CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_quote_id_quotes_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "quote_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "provider_approved";--> statement-breakpoint
DROP TYPE "public"."booking_status";--> statement-breakpoint
DROP TYPE "public"."component_type";--> statement-breakpoint
DROP TYPE "public"."group_buying_status";--> statement-breakpoint
DROP TYPE "public"."mentorship_status";--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
DROP TYPE "public"."project_visibility";