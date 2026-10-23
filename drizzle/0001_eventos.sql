CREATE TABLE "eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tipo" text NOT NULL,
	"dados" jsonb,
	"ip_hash" text
);
--> statement-breakpoint
CREATE INDEX "eventos_tipo_created_at_idx" ON "eventos" USING btree ("tipo","created_at");