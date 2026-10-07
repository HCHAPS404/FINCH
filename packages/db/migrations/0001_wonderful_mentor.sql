CREATE SCHEMA "security";
--> statement-breakpoint
CREATE SCHEMA "finance";
--> statement-breakpoint
CREATE SCHEMA "documents";
--> statement-breakpoint
CREATE TABLE "identity"."party_profiles" (
	"party_id" text PRIMARY KEY NOT NULL,
	"principal_id" text NOT NULL,
	"display_name" text NOT NULL,
	"date_of_birth" text,
	"phone" text,
	"locale" text DEFAULT 'es-CO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "party_profiles_principal_id_unique" UNIQUE("principal_id")
);
--> statement-breakpoint
CREATE TABLE "security"."credentials" (
	"principal_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_algo" text DEFAULT 'scrypt' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credentials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "security"."password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"principal_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."cards" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"party_id" text,
	"created_by_principal_id" text NOT NULL,
	"issuer" text NOT NULL,
	"network" text,
	"last_four" char(4) NOT NULL,
	"credit_limit_minor" bigint,
	"currency" char(3) NOT NULL,
	"cut_day" integer,
	"payment_due_day" integer,
	"truth_class" text DEFAULT 'USER_ASSERTED' NOT NULL,
	"source_type" text DEFAULT 'USER_INPUT' NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."debts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"party_id" text,
	"created_by_principal_id" text NOT NULL,
	"name" text NOT NULL,
	"creditor" text NOT NULL,
	"principal_amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"interest_rate_bps" integer,
	"due_date" date,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"truth_class" text DEFAULT 'USER_ASSERTED' NOT NULL,
	"source_type" text DEFAULT 'USER_INPUT' NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents"."documents" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"party_id" text,
	"created_by_principal_id" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"sha256" text NOT NULL,
	"storage_key" text NOT NULL,
	"status" text DEFAULT 'RAW' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity"."party_profiles" ADD CONSTRAINT "party_profiles_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."party_profiles" ADD CONSTRAINT "party_profiles_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security"."credentials" ADD CONSTRAINT "credentials_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."cards" ADD CONSTRAINT "cards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."cards" ADD CONSTRAINT "cards_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."cards" ADD CONSTRAINT "cards_created_by_principal_id_principals_id_fk" FOREIGN KEY ("created_by_principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."debts" ADD CONSTRAINT "debts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."debts" ADD CONSTRAINT "debts_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."debts" ADD CONSTRAINT "debts_created_by_principal_id_principals_id_fk" FOREIGN KEY ("created_by_principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents"."documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents"."documents" ADD CONSTRAINT "documents_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents"."documents" ADD CONSTRAINT "documents_created_by_principal_id_principals_id_fk" FOREIGN KEY ("created_by_principal_id") REFERENCES "identity"."principals"("id") ON DELETE no action ON UPDATE no action;