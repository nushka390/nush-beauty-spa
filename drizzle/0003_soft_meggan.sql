ALTER TABLE "users" ADD COLUMN "Password" varchar(255) DEFAULT 'password123';--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "_temp";