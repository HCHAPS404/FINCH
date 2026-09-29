/**
 * Identity and tenancy — README §8, §9; ADR-0010, ADR-0011.
 *
 * Principal (who authenticates) · Party (who is economically represented) ·
 * Workspace (isolation boundary) · Membership (principal ↔ workspace) · Grant (a
 * resource-level permission, e.g. a household member sharing one account).
 */
import { PARTY_TYPES, PRINCIPAL_TYPES, WORKSPACE_TYPES } from '@finch/contracts';
import { sql } from 'drizzle-orm';
import { check, index, pgSchema, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { createdAt, currency, id } from './columns.js';

export const identity = pgSchema('identity');

export const principalType = identity.enum('principal_type', PRINCIPAL_TYPES);
export const partyType = identity.enum('party_type', PARTY_TYPES);
export const workspaceType = identity.enum('workspace_type', WORKSPACE_TYPES);
export const membershipRole = identity.enum('membership_role', ['OWNER', 'MEMBER', 'VIEWER']);
export const membershipStatus = identity.enum('membership_status', ['ACTIVE', 'REVOKED']);

export const principals = identity.table('principals', {
  id: id(),
  type: principalType().notNull(),
  displayName: text().notNull(),
  createdAt: createdAt(),
});

export const parties = identity.table('parties', {
  id: id(),
  type: partyType().notNull(),
  displayName: text().notNull(),
  createdAt: createdAt(),
});

export const workspaces = identity.table(
  'workspaces',
  {
    id: id(),
    type: workspaceType().notNull(),
    name: text().notNull(),
    baseCurrency: currency().notNull(),
    locale: text().notNull(),
    timezone: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [check('workspaces_base_currency_iso', sql`${t.baseCurrency} ~ '^[A-Z]{3}$'`)],
);

/** Which parties a workspace represents (a household has several). */
export const workspaceParties = identity.table(
  'workspace_parties',
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    partyId: uuid()
      .notNull()
      .references(() => parties.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('workspace_parties_pk').on(t.workspaceId, t.partyId)],
);

export const memberships = identity.table(
  'memberships',
  {
    id: id(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    principalId: uuid()
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    role: membershipRole().notNull(),
    status: membershipStatus().notNull().default('ACTIVE'),
    createdAt: createdAt(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    uniqueIndex('memberships_workspace_principal').on(t.workspaceId, t.principalId),
    index('memberships_principal').on(t.principalId),
    check(
      'memberships_revoked_consistent',
      sql`(${t.status} = 'REVOKED') = (${t.revokedAt} IS NOT NULL)`,
    ),
  ],
);

/**
 * Resource-level grants. In a household, each person decides what to share
 * (docs/hackathon/08 F1); an ACTIVE membership alone does not reveal a personal account.
 */
export const grants = identity.table(
  'grants',
  {
    id: id(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: 'restrict' }),
    principalId: uuid()
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    resourceType: text().notNull(),
    resourceId: uuid().notNull(),
    action: text().notNull(),
    grantedByPrincipalId: uuid()
      .notNull()
      .references(() => principals.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
    revokedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('grants_workspace').on(t.workspaceId),
    index('grants_lookup').on(t.principalId, t.resourceType, t.resourceId),
  ],
);
