CREATE TYPE "public"."payment_status" AS ENUM('pending', 'successful', 'failed', 'escrowed', 'released', 'refunded');--> statement-breakpoint
CREATE TABLE "machine_capabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"service_id" integer,
	"machine_type" varchar(100) NOT NULL,
	"min_wall_thickness" numeric(10, 3),
	"max_volume" varchar(100),
	"precision" numeric(10, 4),
	"materials_supported" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer,
	"quote_id" integer,
	"payment_provider" varchar(50) NOT NULL,
	"reference" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN',
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'ordered', 'in_production', 'quality_check', 'out_for_delivery', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "component_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "quantity" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "service_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "quote_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "machine_capabilities" ADD CONSTRAINT "machine_capabilities_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "machine_capabilities" ADD CONSTRAINT "machine_capabilities_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;