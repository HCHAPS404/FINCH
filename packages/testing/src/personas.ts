/**
 * Synthetic Colombian personas — README §80.
 *
 * Named archetypes, not real people: every field is generated from a seed. Production
 * data never reaches a developer machine (Constitution §4.18), so this is the only
 * kind of "real-looking" data this codebase is ever allowed to seed a database with.
 */
import type { PrincipalId, PartyId, WorkspaceId, WorkspaceType } from '@finch/contracts';
import {
  createPrincipal,
  createParty,
  createWorkspace,
  createMembership,
  type Principal,
  type Party,
  type Workspace,
  type Membership,
} from '@finch/domain';
import { randomId, type RandomSource } from './random.js';

export const SYNTHETIC_PERSONAS = [
  'salaried_simple',
  'salaried_multi_debt',
  'freelancer_variable',
  'household_shared',
  'credit_card_heavy',
  'saver_goal_oriented',
  'microbusiness_owner',
] as const;

export type SyntheticPersonaId = (typeof SYNTHETIC_PERSONAS)[number];

/** The Workspace type a persona's archetype implies (README §8.3). */
function workspaceTypeFor(personaId: SyntheticPersonaId): WorkspaceType {
  if (personaId === 'household_shared') return 'HOUSEHOLD';
  if (personaId === 'microbusiness_owner') return 'BUSINESS';
  return 'PERSONAL';
}

export interface PersonaIdentity {
  readonly personaId: SyntheticPersonaId;
  readonly principal: Principal;
  readonly party: Party;
  readonly workspace: Workspace;
  readonly membership: Membership;
}

/**
 * Builds a full identity chain for one persona: a human Principal, the Party they
 * economically represent, the Workspace that isolates their data, and the Membership
 * granting them ownership of it. Deterministic given `random` — the same seed always
 * produces the same ids.
 */
export function createPersonaIdentity(
  personaId: SyntheticPersonaId,
  random: RandomSource,
): PersonaIdentity {
  const principal = createPrincipal(
    randomId(random, `${personaId}-principal`) as PrincipalId,
    'HUMAN',
  );
  const party = createParty(randomId(random, `${personaId}-party`) as PartyId, 'PERSON');
  const workspace = createWorkspace(
    randomId(random, `${personaId}-workspace`) as WorkspaceId,
    workspaceTypeFor(personaId),
  );
  const membership = createMembership({
    principalId: principal.id,
    workspaceId: workspace.id,
    capabilities: ['workspace.owner'],
  });

  return { personaId, principal, party, workspace, membership };
}
