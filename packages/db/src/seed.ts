/**
 * Synthetic seed data — README §80, Constitution §4.18.
 *
 * Only synthetic Colombian personas are ever seeded; production data never reaches a
 * developer machine. The seed is deterministic (a fixed random seed) so re-seeding a
 * clean database always produces the same rows.
 */
import { createSeededRandom, createPersonaIdentity, SYNTHETIC_PERSONAS } from '@finch/testing';
import type { Database } from './client.js';
import { principals, parties, workspaces, memberships } from './schema/identity.js';

/** Fixed, not time-derived — a re-seed of a clean database must be reproducible. */
const SEED = 20260917;

export async function seedSyntheticPersonas(db: Database): Promise<number> {
  const random = createSeededRandom(SEED);
  for (const personaId of SYNTHETIC_PERSONAS) {
    const persona = createPersonaIdentity(personaId, random);
    await db.insert(principals).values({ id: persona.principal.id, type: persona.principal.type });
    await db.insert(parties).values({ id: persona.party.id, type: persona.party.type });
    await db.insert(workspaces).values({ id: persona.workspace.id, type: persona.workspace.type });
    await db.insert(memberships).values({
      principalId: persona.membership.principalId,
      workspaceId: persona.membership.workspaceId,
      capabilities: [...persona.membership.capabilities],
      status: persona.membership.status,
    });
  }
  return SYNTHETIC_PERSONAS.length;
}
