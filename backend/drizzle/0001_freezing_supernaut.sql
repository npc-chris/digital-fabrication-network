CREATE TABLE "blog_comment_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"parent_comment_id" integer,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "component_applications" DROP CONSTRAINT "component_applications_subcategory_id_component_subcategories_i";
--> statement-breakpoint
ALTER TABLE "group_buying_participants" DROP CONSTRAINT "group_buying_participants_campaign_id_group_buying_campaigns_id";
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "comment_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "share_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_comment_likes" ADD CONSTRAINT "blog_comment_likes_comment_id_blog_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."blog_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment_likes" ADD CONSTRAINT "blog_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_likes" ADD CONSTRAINT "blog_post_likes_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_likes" ADD CONSTRAINT "blog_post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_applications" ADD CONSTRAINT "component_applications_subcategory_id_component_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."component_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buying_participants" ADD CONSTRAINT "group_buying_participants_campaign_id_group_buying_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."group_buying_campaigns"("id") ON DELETE no action ON UPDATE no action;