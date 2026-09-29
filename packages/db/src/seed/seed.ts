/**
 * Idempotent seed of the synthetic personas. Running it twice changes nothing: every
 * insert is `ON CONFLICT DO NOTHING` over fixed IDs and unique keys.
 */
import type { FinchDatabase } from '../client.js';
import {
  accounts,
  balanceObservations,
  creditCards,
  goals,
  grants,
  incomeStreams,
  loans,
  memberships,
  obligations,
  parties,
  principals,
  transactions,
  workspaceParties,
  workspaces,
} from '../schema/index.js';
import { PERSONAS } from './personas.js';

export async function seedPersonas(db: FinchDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    // Order follows foreign keys.
    await tx
      .insert(principals)
      .values([...PERSONAS.principals])
      .onConflictDoNothing();
    await tx
      .insert(parties)
      .values([...PERSONAS.parties])
      .onConflictDoNothing();
    await tx
      .insert(workspaces)
      .values([...PERSONAS.workspaces])
      .onConflictDoNothing();
    await tx
      .insert(workspaceParties)
      .values([...PERSONAS.workspaceParties])
      .onConflictDoNothing();
    await tx
      .insert(memberships)
      .values([...PERSONAS.memberships])
      .onConflictDoNothing();
    await tx
      .insert(accounts)
      .values([...PERSONAS.accounts])
      .onConflictDoNothing();
    await tx
      .insert(grants)
      .values([...PERSONAS.grants])
      .onConflictDoNothing();
    await tx
      .insert(balanceObservations)
      .values([...PERSONAS.balanceObservations])
      .onConflictDoNothing();
    await tx
      .insert(creditCards)
      .values([...PERSONAS.creditCards])
      .onConflictDoNothing();
    await tx
      .insert(loans)
      .values([...PERSONAS.loans])
      .onConflictDoNothing();
    await tx
      .insert(incomeStreams)
      .values([...PERSONAS.incomeStreams])
      .onConflictDoNothing();
    await tx
      .insert(obligations)
      .values([...PERSONAS.obligations])
      .onConflictDoNothing();
    await tx
      .insert(transactions)
      .values([...PERSONAS.transactions])
      .onConflictDoNothing();
    await tx
      .insert(goals)
      .values([...PERSONAS.goals])
      .onConflictDoNothing();
  });
}
