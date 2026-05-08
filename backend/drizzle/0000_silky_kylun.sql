CREATE TYPE "public"."booking_status" AS ENUM('queued', 'in_progress', 'completed', 'pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."component_type" AS ENUM('electrical', 'mechanical', 'materials', 'consumables', 'sensors', 'thermal', 'chemical', 'tools');--> statement-breakpoint
CREATE TYPE "public"."group_buying_status" AS ENUM('open', 'funding', 'ordered', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."mentorship_status" AS ENUM('open', 'matched', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('public', 'unlisted', 'private');--> statement-breakpoint
CREATE TYPE "public"."supplier_type" AS ENUM('local', 'african', 'international');--> statement-breakpoint
CREATE TYPE "public"."supplier_verification" AS ENUM('unverified', 'pending', 'verified', 'premium');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('explorer', 'provider', 'admin', 'platform_manager');--> statement-breakpoint
CREATE TABLE "affiliate_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"store_name" varchar(255) NOT NULL,
	"description" text,
	"website" varchar(500),
	"logo" varchar(500),
	"location" varchar(255),
	"supplier_type" "supplier_type" DEFAULT 'local' NOT NULL,
	"api_endpoint" varchar(500),
	"api_key" varchar(500),
	"api_format" varchar(50),
	"endpoint_mappings" text,
	"commission_rate" numeric(5, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"is_approved" boolean DEFAULT false,
	"verification_status" "supplier_verification" DEFAULT 'pending',
	"verified_at" timestamp,
	"total_sales" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" "booking_status" DEFAULT 'queued' NOT NULL,
	"project_specs" text,
	"total_cost" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"component_id" integer,
	"affiliate_store_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"external_product_id" varchar(255),
	"external_product_url" varchar(500),
	"product_name" varchar(255),
	"product_image" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"tags" text,
	"images" text,
	"status" varchar(50) DEFAULT 'open',
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "component_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"subcategory_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "component_categories" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "component_comparisons" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"component_ids" text NOT NULL,
	"session_id" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "component_subcategories" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"category_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "components" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "component_type" NOT NULL,
	"subcategory_id" varchar(100),
	"application_id" integer,
	"price" numeric(10, 2) NOT NULL,
	"availability" integer DEFAULT 0,
	"images" text,
	"technical_details" text,
	"datasheet_url" varchar(500),
	"compatibilities" text,
	"location" varchar(255),
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"supplier_type" "supplier_type" DEFAULT 'local',
	"is_affiliate" boolean DEFAULT false,
	"affiliate_store_id" integer,
	"external_url" varchar(500),
	"shipping_time" integer,
	"local_priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"parent_reply_id" integer,
	"like_count" integer DEFAULT 0,
	"is_accepted_answer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"category_id" integer,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"tags" text,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"reply_count" integer DEFAULT 0,
	"last_reply_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "group_buying_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizer_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"component_name" varchar(255) NOT NULL,
	"component_url" varchar(500),
	"supplier_name" varchar(255),
	"supplier_country" varchar(100),
	"unit_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"shipping_cost" numeric(10, 2),
	"customs_duty" numeric(10, 2),
	"minimum_quantity" integer NOT NULL,
	"maximum_quantity" integer,
	"current_quantity" integer DEFAULT 0,
	"participant_count" integer DEFAULT 0,
	"deadline" timestamp NOT NULL,
	"estimated_delivery" timestamp,
	"status" "group_buying_status" DEFAULT 'open' NOT NULL,
	"total_funding" numeric(12, 2) DEFAULT '0',
	"target_funding" numeric(12, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "group_buying_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"contribution" numeric(10, 2) NOT NULL,
	"is_paid" boolean DEFAULT false,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mentorship_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentee_id" integer NOT NULL,
	"mentor_id" integer,
	"topic" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"goals" text,
	"status" "mentorship_status" DEFAULT 'open' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_type" varchar(50),
	"related_id" integer,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"explorer_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"component_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"company" varchar(255),
	"bio" text,
	"location" varchar(255),
	"phone" varchar(50),
	"avatar" varchar(500),
	"portfolio" text,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"supplier_type" "supplier_type" DEFAULT 'local',
	"verification_status" "supplier_verification" DEFAULT 'unverified',
	"verified_at" timestamp,
	"is_mentor" boolean DEFAULT false,
	"mentorship_areas" text,
	"mentor_bio" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_boms" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"component_name" varchar(255) NOT NULL,
	"component_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2),
	"supplier" varchar(255),
	"notes" text,
	"alternative_components" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"images" text,
	"notes" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"tags" text,
	"images" text,
	"visibility" "project_visibility" DEFAULT 'public' NOT NULL,
	"difficulty" varchar(50),
	"estimated_cost" numeric(10, 2),
	"estimated_time" integer,
	"instructions" text,
	"tools_required" text,
	"is_open_for_collaboration" boolean DEFAULT false,
	"collaborators" text,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"fork_count" integer DEFAULT 0,
	"completed_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"project_description" text NOT NULL,
	"specifications" text,
	"estimated_price" numeric(10, 2),
	"estimated_duration" integer,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewer_id" integer NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"equipment_specs" text,
	"pricing_model" varchar(50),
	"price_per_unit" numeric(10, 2),
	"lead_time" integer,
	"images" text,
	"location" varchar(255),
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"google_id" varchar(255),
	"role" "user_role" DEFAULT 'explorer' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"onboarding_completed" boolean DEFAULT false,
	"provider_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_url" varchar(500) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"reviewed_by" integer,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"component_id" integer,
	"service_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "affiliate_stores" ADD CONSTRAINT "affiliate_stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_affiliate_store_id_affiliate_stores_id_fk" FOREIGN KEY ("affiliate_store_id") REFERENCES "public"."affiliate_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_applications" ADD CONSTRAINT "component_applications_subcategory_id_component_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."component_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_comparisons" ADD CONSTRAINT "component_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_subcategories" ADD CONSTRAINT "component_subcategories_category_id_component_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."component_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_subcategory_id_component_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."component_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_application_id_component_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."component_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buying_campaigns" ADD CONSTRAINT "group_buying_campaigns_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buying_participants" ADD CONSTRAINT "group_buying_participants_campaign_id_group_buying_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."group_buying_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buying_participants" ADD CONSTRAINT "group_buying_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_requests" ADD CONSTRAINT "mentorship_requests_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_explorer_id_users_id_fk" FOREIGN KEY ("explorer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_replies" ADD CONSTRAINT "post_replies_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_replies" ADD CONSTRAINT "post_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_boms" ADD CONSTRAINT "project_boms_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_boms" ADD CONSTRAINT "project_boms_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_completions" ADD CONSTRAINT "project_completions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_completions" ADD CONSTRAINT "project_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;