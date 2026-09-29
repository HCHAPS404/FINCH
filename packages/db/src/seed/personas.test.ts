/**
 * Persona integrity — no database needed. Guards the rules seeds must follow
 * (Constitution §4.18, README §8.6, §14.1).
 */
import { describe, expect, it } from 'vitest';

import { IDS, PERSONAS, seedId } from './personas.js';

const workspaceIds = new Set<string>(PERSONAS.workspaces.map((w) => w.id));
const tenantRows = [
  ...PERSONAS.memberships,
  ...PERSONAS.grants,
  ...PERSONAS.accounts,
  ...PERSONAS.balanceObservations,
  ...PERSONAS.creditCards,
  ...PERSONAS.loans,
  ...PERSONAS.incomeStreams,
  ...PERSONAS.obligations,
  ...PERSONAS.transactions,
  ...PERSONAS.goals,
];

describe('synthetic personas', () => {
  it('produces valid, unique v4-shaped IDs', () => {
    expect(seedId(7)).toBe('5eed0000-0000-4000-8000-000000000007');
    const ids = tenantRows.flatMap((row) => ('id' in row ? [row.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts every tenant row in a seeded workspace', () => {
    for (const row of tenantRows) expect(workspaceIds.has(row.workspaceId)).toBe(true);
  });

  it('keeps each account in the workspace of its terms and statement lines', () => {
    const accountWorkspace = new Map<string, string>(
      PERSONAS.accounts.map((a) => [a.id, a.workspaceId]),
    );
    for (const row of [
      ...PERSONAS.creditCards,
      ...PERSONAS.loans,
      ...PERSONAS.transactions,
      ...PERSONAS.balanceObservations,
    ]) {
      expect(accountWorkspace.get(row.accountId)).toBe(row.workspaceId);
    }
  });

  it('stores money as bigint minor units, never as numbers', () => {
    const amounts = [
      ...PERSONAS.transactions.map((t) => t.amountMinor),
      ...PERSONAS.incomeStreams.map((i) => i.amountMinor),
      ...PERSONAS.obligations.map((o) => o.amountMinor),
      ...PERSONAS.loans.flatMap((l) => [l.principalMinor, l.outstandingMinor, l.instalmentMinor]),
      ...PERSONAS.creditCards.map((c) => c.creditLimitMinor),
      ...PERSONAS.goals.map((g) => g.targetMinor),
    ];
    for (const amount of amounts) expect(typeof amount).toBe('bigint');
  });

  it('records the French instalment verified independently (colombia-credit.md §2)', () => {
    expect(PERSONAS.loans[0].instalmentMinor).toBe(36_757_218n);
  });

  it('contains no full account numbers or contact data', () => {
    const serialized = JSON.stringify(PERSONAS, (_key, value: unknown) =>
      typeof value === 'bigint' ? value.toString() : value,
    );
    expect(serialized).not.toMatch(/@[A-Za-z0-9-]+\.[A-Za-z]/); // no emails
    for (const account of PERSONAS.accounts) {
      if (account.maskedNumber !== null) expect(account.maskedNumber).toMatch(/^\d{4}$/);
    }
    for (const { displayName } of PERSONAS.principals) expect(displayName).toContain('(demo)');
  });

  it('plants the cases the demo depends on', () => {
    // A price rise (D2): the same streaming merchant at two different amounts.
    const streaming = PERSONAS.transactions.filter((t) => t.merchantNormalized === 'VideoStream');
    expect(new Set(streaming.map((t) => t.amountMinor)).size).toBe(2);
    // A duplicate charge (D3): same merchant, amount and day, distinct statement lines.
    const market = PERSONAS.transactions.filter((t) => t.merchantNormalized === 'Supermarket');
    expect(market).toHaveLength(2);
    expect(new Set(market.map((t) => t.dedupeKey)).size).toBe(2);
    // Household privacy (F1): Julián has no grant on Camila's personal card.
    const julianOnCard = PERSONAS.grants.filter(
      (g) => g.principalId === IDS.perez.julianPrincipal && g.resourceId === IDS.perez.camilaCard,
    );
    expect(julianOnCard).toHaveLength(0);
    // Variable income (B6) is an estimate, never an assertion.
    const variable = PERSONAS.incomeStreams.filter((i) => i.variable);
    expect(variable.every((i) => i.truthClass === 'ESTIMATED')).toBe(true);
  });
});
