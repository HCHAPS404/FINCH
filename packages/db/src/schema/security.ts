/**
 * Security schema — ADR-0041.
 *
 * Kept separate from `identity` deliberately: `identity.principals` models *who*
 * authenticates (README §8.1) and stays free of anything credential-shaped, so a
 * future federated-identity migration (ADR-0015) touches this schema, never that one.
 */
import { pgSchema, text, timestamp } from 'drizzle-orm/pg-core';
import { principals } from './identity.js';

export const security = pgSchema('security');

export const credentials = security.table('credentials', {
  principalId: text('principal_id')
    .primaryKey()
    .references(() => principals.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  passwordAlgo: text('password_algo').notNull().default('scrypt'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * The raw token is never stored (ADR-0041 security impact) — only its hash, so a
 * leaked database row cannot itself be used to reset a password.
 */
export const passwordResetTokens = security.table('password_reset_tokens', {
  id: text('id').primaryKey(),
  principalId: text('principal_id')
    .notNull()
    .references(() => principals.id),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
