ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_public" boolean DEFAULT false;