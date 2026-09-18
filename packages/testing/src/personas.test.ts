/**
 * Synthetic persona tests — README §80, §8.
 */
import { describe, it, expect } from 'vitest';
import { membershipGrants } from '@finch/domain';
import { createSeededRandom } from './random.js';
import { SYNTHETIC_PERSONAS, createPersonaIdentity } from './personas.js';

describe('SYNTHETIC_PERSONAS', () => {
  it('enumerates exactly the seven archetypes from README §80', () => {
    expect([...SYNTHETIC_PERSONAS]).toEqual([
      'salaried_simple',
      'salaried_multi_debt',
      'freelancer_variable',
      'household_shared',
      'credit_card_heavy',
      'saver_goal_oriented',
      'microbusiness_owner',
    ]);
  });
});

describe('createPersonaIdentity', () => {
  it('is deterministic given the same seed', () => {
    const a = createPersonaIdentity('salaried_simple', createSeededRandom(1));
    const b = createPersonaIdentity('salaried_simple', createSeededRandom(1));
    expect(a).toEqual(b);
  });

  it('grants the persona ownership of its own workspace', () => {
    const persona = createPersonaIdentity('salaried_simple', createSeededRandom(1));
    expect(membershipGrants(persona.membership, 'workspace.owner')).toBe(true);
    expect(persona.membership.principalId).toBe(persona.principal.id);
    expect(persona.membership.workspaceId).toBe(persona.workspace.id);
  });

  it.each(SYNTHETIC_PERSONAS)('builds a well-formed identity for %s', (personaId) => {
    const persona = createPersonaIdentity(personaId, createSeededRandom(1));
    expect(persona.principal.type).toBe('HUMAN');
    expect(persona.party.type).toBe('PERSON');
  });

  it('models a shared household as a HOUSEHOLD workspace', () => {
    const persona = createPersonaIdentity('household_shared', createSeededRandom(1));
    expect(persona.workspace.type).toBe('HOUSEHOLD');
  });

  it('models a microbusiness owner as a BUSINESS workspace', () => {
    const persona = createPersonaIdentity('microbusiness_owner', createSeededRandom(1));
    expect(persona.workspace.type).toBe('BUSINESS');
  });

  it('models every other archetype as a PERSONAL workspace', () => {
    const persona = createPersonaIdentity('freelancer_variable', createSeededRandom(1));
    expect(persona.workspace.type).toBe('PERSONAL');
  });
});
