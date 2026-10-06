/**
 * Identity schema — README §8, §24.2.
 *
 * Mirrors the Principal/Party/Workspace/Membership model in `@finch/domain` at the
 * storage layer. Types are stored as `text` rather than a Postgres `enum`: README §8.1,
 * §8.2, §8.3 keep these value sets small but open (a new Principal or Workspace type is
 * a product decision, not a schema migration this package should gate).
 */
import { pgSchema, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const identity = pgSchema('identity');

export const principals = identity.table('principals', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const parties = identity.table('parties', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Personal data (signup display name, date of birth, phone) lives here rather than on
 * `parties` itself — same reason `security.credentials` stays off `principals`
 * (README §8.6, §100): the identity/tenancy entities stay minimal and open, personal
 * data that only ever matters for a `PERSON`-type Party lives alongside it, not on it.
 */
export const partyProfiles = identity.table('party_profiles', {
  partyId: text('party_id')
    .primaryKey()
    .references(() => parties.id),
  displayName: text('display_name').notNull(),
  dateOfBirth: text('date_of_birth'),
  phone: text('phone'),
  locale: text('locale').notNull().default('es-CO'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workspaces = identity.table('workspaces', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * README §8.6: every tenant-owned resource carries a `workspace_id`. A Membership is
 * the tenant-owned resource that grants a Principal access to that workspace in the
 * first place, so the pair is its primary key — one row per (principal, workspace).
 */
export const memberships = identity.table(
  'memberships',
  {
    principalId: text('principal_id')
      .notNull()
      .references(() => principals.id),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    capabilities: text('capabilities').array().notNull(),
    status: text('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.principalId, table.workspaceId] })],
);
