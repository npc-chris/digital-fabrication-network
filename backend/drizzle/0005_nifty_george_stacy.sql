ALTER TABLE "profiles" ADD COLUMN "username" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_unique" UNIQUE("username");