-- Append-only guards — README §13 (immutable snapshots), §14 and ADR-0027 (audit),
-- docs/hackathon/04 §3 (calculation receipts are evidence).
--
-- Enforced in the database, not only in application code: a bug, a script or a manual
-- console session cannot rewrite history. Retention and account-deletion purges
-- (README §51) will get their own audited function in a later migration; until then
-- these rows cannot be updated or deleted at all.

CREATE FUNCTION "audit"."reject_mutation"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '%.% is append-only: % is not allowed', TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "financial_snapshots_append_only"
  BEFORE UPDATE OR DELETE ON "planning"."financial_snapshots"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "calc_receipts_append_only"
  BEFORE UPDATE OR DELETE ON "decision"."calc_receipts"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "audit_events_append_only"
  BEFORE UPDATE OR DELETE ON "audit"."audit_events"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "ai_calls_append_only"
  BEFORE UPDATE OR DELETE ON "audit"."ai_calls"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
-- TRUNCATE bypasses row triggers; block it too.
CREATE TRIGGER "financial_snapshots_no_truncate"
  BEFORE TRUNCATE ON "planning"."financial_snapshots"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "calc_receipts_no_truncate"
  BEFORE TRUNCATE ON "decision"."calc_receipts"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "audit_events_no_truncate"
  BEFORE TRUNCATE ON "audit"."audit_events"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_mutation"();
--> statement-breakpoint
CREATE TRIGGER "ai_calls_no_truncate"
  BEFORE TRUNCATE ON "audit"."ai_calls"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_mutation"();
