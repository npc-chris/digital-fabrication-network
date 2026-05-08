CREATE TABLE "onboarding_submissions" (
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
ALTER TABLE "onboarding_submissions" ADD CONSTRAINT "onboarding_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;