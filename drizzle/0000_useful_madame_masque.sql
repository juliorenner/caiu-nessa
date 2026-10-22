CREATE TABLE "jogadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"respostas" jsonb NOT NULL,
	"acertos" integer NOT NULL,
	"total" integer NOT NULL,
	"acertos_esquerda" integer NOT NULL,
	"acertos_direita" integer NOT NULL,
	"ip_hash" text
);
--> statement-breakpoint
CREATE INDEX "jogadas_ip_hash_created_at_idx" ON "jogadas" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "jogadas_created_at_idx" ON "jogadas" USING btree ("created_at");