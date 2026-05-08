CREATE TABLE "order_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"location" varchar(255),
	"description" text,
	"waybill_id" varchar(100),
	"proof_image" varchar(500),
	"estimated_delivery" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "buildability_score" integer;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "risk_buffer" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;