ALTER TABLE "cart_items" ALTER COLUMN "external_product_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "group_buying_campaigns" ALTER COLUMN "component_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "campaign_id" integer;--> statement-breakpoint
ALTER TABLE "group_buying_campaigns" ADD COLUMN "images" text;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_campaign_id_group_buying_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."group_buying_campaigns"("id") ON DELETE no action ON UPDATE no action;