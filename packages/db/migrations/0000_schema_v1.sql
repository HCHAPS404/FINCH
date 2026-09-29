CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE SCHEMA "finance";
--> statement-breakpoint
CREATE SCHEMA "planning";
--> statement-breakpoint
CREATE SCHEMA "decision";
--> statement-breakpoint
CREATE SCHEMA "documents";
--> statement-breakpoint
CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "integration";
--> statement-breakpoint
CREATE TYPE "public"."rate_convention" AS ENUM('EA', 'MV', 'NAMV');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('PROVIDER', 'DOCUMENT', 'USER_INPUT', 'COMPUTATION', 'MODEL', 'IMPORT');--> statement-breakpoint
CREATE TYPE "public"."truth_class" AS ENUM('OBSERVED', 'USER_ASSERTED', 'DERIVED_DETERMINISTIC', 'ESTIMATED', 'GENERATED_NARRATIVE');--> statement-breakpoint
CREATE TYPE "identity"."membership_role" AS ENUM('OWNER', 'MEMBER', 'VIEWER');--> statement-breakpoint
CREATE TYPE "identity"."membership_status" AS ENUM('ACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TYPE "identity"."party_type" AS ENUM('PERSON', 'ORGANIZATION');--> statement-breakpoint
CREATE TYPE "identity"."principal_type" AS ENUM('HUMAN', 'SERVICE', 'SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "identity"."workspace_type" AS ENUM('PERSONAL', 'HOUSEHOLD', 'BUSINESS');--> statement-breakpoint
CREATE TYPE "finance"."account_kind" AS ENUM('CHECKING', 'SAVINGS', 'CASH', 'CREDIT_CARD', 'LOAN', 'INVESTMENT');--> statement-breakpoint
CREATE TYPE "finance"."cadence" AS ENUM('WEEKLY', 'BIWEEKLY', 'SEMIMONTHLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "finance"."income_kind" AS ENUM('SALARY', 'FEES', 'RENT', 'BUSINESS', 'OTHER');--> statement-breakpoint
CREATE TYPE "finance"."insurance_basis" AS ENUM('OUTSTANDING', 'ORIGINAL', 'FIXED');--> statement-breakpoint
CREATE TYPE "finance"."transaction_status" AS ENUM('PENDING', 'POSTED', 'REVERSED');--> statement-breakpoint
CREATE TYPE "planning"."envelope_kind" AS ENUM('ESSENTIAL', 'DEBT', 'SAVINGS', 'INVESTMENT', 'LEISURE', 'OTHER');--> statement-breakpoint
CREATE TYPE "decision"."decision_card_status" AS ENUM('OPEN', 'DISMISSED', 'ACTED', 'SUPERSEDED');--> statement-breakpoint
CREATE TYPE "decision"."memory_kind" AS ENUM('GOAL', 'PREFERENCE', 'CONTEXT', 'CONSTRAINT');--> statement-breakpoint
CREATE TYPE "documents"."document_kind" AS ENUM('RECEIPT', 'INVOICE', 'STATEMENT', 'POLICY', 'CONTRACT', 'SOAT', 'WARRANTY', 'CERTIFICATE', 'OTHER');--> statement-breakpoint
CREATE TYPE "documents"."document_status" AS ENUM('QUARANTINED', 'ACCEPTED', 'REJECTED', 'DELETED');--> statement-breakpoint
CREATE TYPE "audit"."ai_call_outcome" AS ENUM('OK', 'BLOCKED', 'FAILED');--> statement-breakpoint
CREATE TYPE "audit"."ai_tier" AS ENUM('FAST', 'AGENT', 'DEEP');--> statement-breakpoint
CREATE TYPE "audit"."audit_outcome" AS ENUM('ALLOWED', 'DENIED', 'FAILED');--> statement-breakpoint
CREATE TABLE "identity"."grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"principal_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"action" text NOT NULL,
	"granted_by_principal_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "identity"."memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"principal_id" uuid NOT NULL,
	"role" "identity"."membership_role" NOT NULL,
	"status" "identity"."membership_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "memberships_revoked_consistent" CHECK (("identity"."memberships"."status" = 'REVOKED') = ("identity"."memberships"."revoked_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "identity"."parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "identity"."party_type" NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."principals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "identity"."principal_type" NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."workspace_parties" (
	"workspace_id" uuid NOT NULL,
	"party_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "identity"."workspace_type" NOT NULL,
	"name" text NOT NULL,
	"base_currency" char(3) NOT NULL,
	"locale" text NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_base_currency_iso" CHECK ("identity"."workspaces"."base_currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_party_id" uuid,
	"kind" "finance"."account_kind" NOT NULL,
	"name" text NOT NULL,
	"institution_name" text,
	"currency" char(3) NOT NULL,
	"masked_number" text,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "accounts_currency_iso" CHECK ("finance"."accounts"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "accounts_masked_last4" CHECK ("finance"."accounts"."masked_number" IS NULL OR "finance"."accounts"."masked_number" ~ '^[0-9]{4}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."balance_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "balance_observations_currency_iso" CHECK ("finance"."balance_observations"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."credit_cards" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"credit_limit_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"cutoff_day" smallint NOT NULL,
	"payment_day" smallint NOT NULL,
	"rate_value" numeric(12, 6) NOT NULL,
	"rate_convention" "rate_convention" NOT NULL,
	"handling_fee_minor" bigint DEFAULT 0 NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_cards_days" CHECK ("finance"."credit_cards"."cutoff_day" BETWEEN 1 AND 31 AND "finance"."credit_cards"."payment_day" BETWEEN 1 AND 31),
	CONSTRAINT "credit_cards_limit_positive" CHECK ("finance"."credit_cards"."credit_limit_minor" > 0),
	CONSTRAINT "credit_cards_currency_iso" CHECK ("finance"."credit_cards"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."income_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"party_id" uuid,
	"name" text NOT NULL,
	"kind" "finance"."income_kind" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"cadence" "finance"."cadence" NOT NULL,
	"expected_day" smallint,
	"variable" boolean DEFAULT false NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "income_streams_positive" CHECK ("finance"."income_streams"."amount_minor" > 0),
	CONSTRAINT "income_streams_day" CHECK ("finance"."income_streams"."expected_day" IS NULL OR "finance"."income_streams"."expected_day" BETWEEN 1 AND 31),
	CONSTRAINT "income_streams_currency_iso" CHECK ("finance"."income_streams"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."loans" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"principal_minor" bigint NOT NULL,
	"outstanding_minor" bigint NOT NULL,
	"instalment_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"rate_value" numeric(12, 6) NOT NULL,
	"rate_convention" "rate_convention" NOT NULL,
	"term_months" smallint NOT NULL,
	"remaining_instalments" smallint NOT NULL,
	"payment_day" smallint NOT NULL,
	"insurance_basis" "finance"."insurance_basis",
	"insurance_rate_value" numeric(12, 6),
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loans_terms_consistent" CHECK ("finance"."loans"."term_months" > 0 AND "finance"."loans"."remaining_instalments" BETWEEN 0 AND "finance"."loans"."term_months"),
	CONSTRAINT "loans_outstanding_bounded" CHECK ("finance"."loans"."outstanding_minor" BETWEEN 0 AND "finance"."loans"."principal_minor"),
	CONSTRAINT "loans_payment_day" CHECK ("finance"."loans"."payment_day" BETWEEN 1 AND 31),
	CONSTRAINT "loans_currency_iso" CHECK ("finance"."loans"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"cadence" "finance"."cadence" NOT NULL,
	"due_day" smallint NOT NULL,
	"essential" boolean NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "obligations_positive" CHECK ("finance"."obligations"."amount_minor" > 0),
	CONSTRAINT "obligations_due_day" CHECK ("finance"."obligations"."due_day" BETWEEN 1 AND 31),
	CONSTRAINT "obligations_currency_iso" CHECK ("finance"."obligations"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "finance"."transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"booked_on" date NOT NULL,
	"description" text NOT NULL,
	"merchant_normalized" text,
	"category" text,
	"status" "finance"."transaction_status" NOT NULL,
	"dedupe_key" text NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"source_type" "source_type" NOT NULL,
	"source_ref" text NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_currency_iso" CHECK ("finance"."transactions"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "planning"."envelopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" "planning"."envelope_kind" NOT NULL,
	"cycle_start" date NOT NULL,
	"allocated_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "envelopes_allocated_nonnegative" CHECK ("planning"."envelopes"."allocated_minor" >= 0),
	CONSTRAINT "envelopes_currency_iso" CHECK ("planning"."envelopes"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "planning"."financial_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checksum" text NOT NULL,
	"payload" jsonb NOT NULL,
	"rule_versions" jsonb NOT NULL,
	CONSTRAINT "financial_snapshots_checksum_hex" CHECK ("planning"."financial_snapshots"."checksum" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "planning"."goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"target_date" date,
	"priority" smallint NOT NULL,
	"shared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "goals_target_positive" CHECK ("planning"."goals"."target_minor" > 0),
	CONSTRAINT "goals_priority" CHECK ("planning"."goals"."priority" BETWEEN 1 AND 10),
	CONSTRAINT "goals_currency_iso" CHECK ("planning"."goals"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "decision"."calc_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"skill" text NOT NULL,
	"formula_id" text NOT NULL,
	"formula_version" integer NOT NULL,
	"engine_version" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"inputs_hash" text NOT NULL,
	"outputs" jsonb NOT NULL,
	"truth_class" "truth_class" NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calc_receipts_formula_version_positive" CHECK ("decision"."calc_receipts"."formula_version" > 0),
	CONSTRAINT "calc_receipts_inputs_hash_hex" CHECK ("decision"."calc_receipts"."inputs_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "calc_receipts_truth_class" CHECK ("decision"."calc_receipts"."truth_class" IN ('DERIVED_DETERMINISTIC', 'ESTIMATED'))
);
--> statement-breakpoint
CREATE TABLE "decision"."decision_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"status" "decision"."decision_card_status" DEFAULT 'OPEN' NOT NULL,
	"priority" smallint NOT NULL,
	"payload" jsonb NOT NULL,
	"receipt_ids" uuid[] NOT NULL,
	"second_opinion" jsonb,
	"superseded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "decision_cards_priority" CHECK ("decision"."decision_cards"."priority" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "decision"."memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" "decision"."memory_kind" NOT NULL,
	"text" text NOT NULL,
	"source_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"forgotten_at" timestamp with time zone,
	CONSTRAINT "memories_text_length" CHECK (char_length("decision"."memories"."text") BETWEEN 1 AND 2000)
);
--> statement-breakpoint
CREATE TABLE "documents"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" "documents"."document_kind" NOT NULL,
	"status" "documents"."document_status" DEFAULT 'QUARANTINED' NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"storage_key" text NOT NULL,
	"uploaded_by_principal_id" uuid NOT NULL,
	"expires_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "documents_mime_allowlist" CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/csv')),
	CONSTRAINT "documents_size" CHECK ("documents"."documents"."size_bytes" BETWEEN 1 AND 10485760),
	CONSTRAINT "documents_sha256_hex" CHECK ("documents"."documents"."sha256" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "documents_deleted_consistent" CHECK (("documents"."documents"."status" = 'DELETED') = ("documents"."documents"."deleted_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "audit"."ai_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correlation_id" text NOT NULL,
	"workspace_id" uuid,
	"tier" "audit"."ai_tier" NOT NULL,
	"model" text,
	"prompt_id" text,
	"outcome" "audit"."ai_call_outcome" NOT NULL,
	"failure" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer NOT NULL,
	"redactions_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_calls_counts_nonnegative" CHECK ("audit"."ai_calls"."latency_ms" >= 0 AND "audit"."ai_calls"."redactions_count" >= 0 AND coalesce("audit"."ai_calls"."input_tokens", 0) >= 0 AND coalesce("audit"."ai_calls"."output_tokens", 0) >= 0)
);
--> statement-breakpoint
CREATE TABLE "audit"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"actor_principal_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"outcome" "audit"."audit_outcome" NOT NULL,
	"correlation_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"event_version" integer NOT NULL,
	"workspace_id" uuid,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"producer" text NOT NULL,
	"correlation_id" text NOT NULL,
	"causation_id" text,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity"."grants" ADD CONSTRAINT "grants_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."grants" ADD CONSTRAINT "grants_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "identity"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."grants" ADD CONSTRAINT "grants_granted_by_principal_id_principals_id_fk" FOREIGN KEY ("granted_by_principal_id") REFERENCES "identity"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."memberships" ADD CONSTRAINT "memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."memberships" ADD CONSTRAINT "memberships_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "identity"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."workspace_parties" ADD CONSTRAINT "workspace_parties_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."workspace_parties" ADD CONSTRAINT "workspace_parties_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."accounts" ADD CONSTRAINT "accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."accounts" ADD CONSTRAINT "accounts_owner_party_id_parties_id_fk" FOREIGN KEY ("owner_party_id") REFERENCES "identity"."parties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."balance_observations" ADD CONSTRAINT "balance_observations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."balance_observations" ADD CONSTRAINT "balance_observations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finance"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."credit_cards" ADD CONSTRAINT "credit_cards_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finance"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."credit_cards" ADD CONSTRAINT "credit_cards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."income_streams" ADD CONSTRAINT "income_streams_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."income_streams" ADD CONSTRAINT "income_streams_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "identity"."parties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."loans" ADD CONSTRAINT "loans_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finance"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."loans" ADD CONSTRAINT "loans_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."obligations" ADD CONSTRAINT "obligations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."transactions" ADD CONSTRAINT "transactions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finance"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning"."envelopes" ADD CONSTRAINT "envelopes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning"."financial_snapshots" ADD CONSTRAINT "financial_snapshots_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning"."goals" ADD CONSTRAINT "goals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision"."calc_receipts" ADD CONSTRAINT "calc_receipts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision"."decision_cards" ADD CONSTRAINT "decision_cards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision"."memories" ADD CONSTRAINT "memories_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents"."documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents"."documents" ADD CONSTRAINT "documents_uploaded_by_principal_id_principals_id_fk" FOREIGN KEY ("uploaded_by_principal_id") REFERENCES "identity"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit"."ai_calls" ADD CONSTRAINT "ai_calls_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_actor_principal_id_principals_id_fk" FOREIGN KEY ("actor_principal_id") REFERENCES "identity"."principals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration"."outbox_events" ADD CONSTRAINT "outbox_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "identity"."workspaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "grants_workspace" ON "identity"."grants" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "grants_lookup" ON "identity"."grants" USING btree ("principal_id","resource_type","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_workspace_principal" ON "identity"."memberships" USING btree ("workspace_id","principal_id");--> statement-breakpoint
CREATE INDEX "memberships_principal" ON "identity"."memberships" USING btree ("principal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_parties_pk" ON "identity"."workspace_parties" USING btree ("workspace_id","party_id");--> statement-breakpoint
CREATE INDEX "accounts_workspace" ON "finance"."accounts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "balance_observations_account_time" ON "finance"."balance_observations" USING btree ("account_id","observed_at");--> statement-breakpoint
CREATE INDEX "balance_observations_workspace" ON "finance"."balance_observations" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "credit_cards_workspace" ON "finance"."credit_cards" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "income_streams_workspace" ON "finance"."income_streams" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "loans_workspace" ON "finance"."loans" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "obligations_workspace" ON "finance"."obligations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_workspace_dedupe" ON "finance"."transactions" USING btree ("workspace_id","dedupe_key");--> statement-breakpoint
CREATE INDEX "transactions_account_booked" ON "finance"."transactions" USING btree ("account_id","booked_on");--> statement-breakpoint
CREATE UNIQUE INDEX "envelopes_workspace_cycle_name" ON "planning"."envelopes" USING btree ("workspace_id","cycle_start","name");--> statement-breakpoint
CREATE INDEX "financial_snapshots_workspace_time" ON "planning"."financial_snapshots" USING btree ("workspace_id","generated_at");--> statement-breakpoint
CREATE INDEX "goals_workspace" ON "planning"."goals" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "calc_receipts_workspace_time" ON "decision"."calc_receipts" USING btree ("workspace_id","computed_at");--> statement-breakpoint
CREATE INDEX "decision_cards_workspace_status" ON "decision"."decision_cards" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "memories_active" ON "decision"."memories" USING btree ("workspace_id") WHERE "decision"."memories"."forgotten_at" IS NULL;--> statement-breakpoint
CREATE INDEX "documents_workspace" ON "documents"."documents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "documents_expiry" ON "documents"."documents" USING btree ("workspace_id","expires_on") WHERE "documents"."documents"."expires_on" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "ai_calls_time" ON "audit"."ai_calls" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_calls_correlation" ON "audit"."ai_calls" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "audit_events_workspace_time" ON "audit"."audit_events" USING btree ("workspace_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_correlation" ON "audit"."audit_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "outbox_events_unpublished" ON "integration"."outbox_events" USING btree ("occurred_at") WHERE "integration"."outbox_events"."published_at" IS NULL;