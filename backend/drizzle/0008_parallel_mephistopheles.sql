CREATE TYPE "public"."plan_tier" AS ENUM('free', 'team', 'business', 'enterprise');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text,
	"html_content" text NOT NULL,
	"cover_image_url" varchar(500),
	"category" varchar(100) DEFAULT 'Engineering',
	"badge" varchar(80),
	"status" varchar(40) DEFAULT 'draft' NOT NULL,
	"author_id" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "escrow_holds" (
	"id" serial PRIMARY KEY NOT NULL,
	"hold_code" varchar(120) NOT NULL,
	"rfq_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"milestone_index" integer,
	"hold_type" varchar(64) NOT NULL,
	"reason" text NOT NULL,
	"reference_id" varchar(120),
	"affected_serial_numbers" text,
	"active" boolean DEFAULT true NOT NULL,
	"applied_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"resolved_by" integer,
	"resolution_action" varchar(80),
	"notes" text,
	CONSTRAINT "escrow_holds_hold_code_unique" UNIQUE("hold_code")
);
--> statement-breakpoint
CREATE TABLE "escrow_idempotency" (
	"id" serial PRIMARY KEY NOT NULL,
	"idempotency_key" varchar(160) NOT NULL,
	"operation" varchar(64) NOT NULL,
	"response_json" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "escrow_idempotency_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "escrow_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer,
	"rfq_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"milestone_index" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN',
	"status" varchar(50) DEFAULT 'locked' NOT NULL,
	"work_authorization_ticket" varchar(255),
	"released_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(80) NOT NULL,
	"rfq_id" integer,
	"org_id" varchar(120) NOT NULL,
	"cac_number" varchar(64),
	"tin_number" varchar(64),
	"subtotal_amount" numeric(12, 2) NOT NULL,
	"vat_amount" numeric(12, 2) NOT NULL,
	"wht_amount" numeric(12, 2) NOT NULL,
	"net_payable_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN' NOT NULL,
	"items_json" text,
	"paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "org_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" varchar(120) NOT NULL,
	"plan" "plan_tier" DEFAULT 'free' NOT NULL,
	"status" varchar(40) DEFAULT 'active' NOT NULL,
	"jobs_remaining" integer DEFAULT 10 NOT NULL,
	"batch_size_limit" integer DEFAULT 2 NOT NULL,
	"api_calls_remaining" integer DEFAULT 100 NOT NULL,
	"features" text DEFAULT '[]' NOT NULL,
	"payment_provider" varchar(50) DEFAULT 'flutterwave' NOT NULL,
	"last_transaction_ref" varchar(120),
	"period_starts_at" timestamp DEFAULT now(),
	"period_ends_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "org_subscriptions_org_id_unique" UNIQUE("org_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_key" varchar(120) NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_org_key_unique" UNIQUE("org_key")
);
--> statement-breakpoint
CREATE TABLE "qc_inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" varchar(100) NOT NULL,
	"part_number" varchar(100) NOT NULL,
	"operator_id" integer,
	"operator_name" varchar(255),
	"nominal_mm" numeric(10, 4) NOT NULL,
	"tolerance_upper_mm" numeric(10, 4) NOT NULL,
	"tolerance_lower_mm" numeric(10, 4) NOT NULL,
	"max_taper_mm" numeric(10, 4) DEFAULT '0.0030',
	"readings" text NOT NULL,
	"taper_deviation_mm" numeric(10, 4) NOT NULL,
	"status" varchar(50) NOT NULL,
	"failure_reason" text,
	"photo_url" varchar(500),
	"notes" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "queue_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" varchar(120) NOT NULL,
	"queue_name" varchar(80) NOT NULL,
	"job_type" varchar(120) NOT NULL,
	"target_service" varchar(64) NOT NULL,
	"org_id" varchar(120),
	"payload" text NOT NULL,
	"status" varchar(40) DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"dispatched_to_url" varchar(255),
	"result_json" text,
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "queue_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" varchar(120) NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshop_subaccounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"gateway" varchar(50) DEFAULT 'flutterwave' NOT NULL,
	"subaccount_code" varchar(120) NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"settlement_bank" varchar(50) NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"percentage_charge" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "workshop_subaccounts_subaccount_code_unique" UNIQUE("subaccount_code")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "org_id" varchar(120);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "org_role" varchar(40) DEFAULT 'owner';--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;