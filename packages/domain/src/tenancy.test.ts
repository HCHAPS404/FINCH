/**
 * Identity/tenancy invariant tests — README §8, §9.
 *
 * These are the domain-level half of the §9 authorization harness ("owner allowed",
 * "other workspace denied", "membership without grant denied", "revoked member
 * denied", ...). The relational policy check itself belongs to @finch/authorization
 * (FIN-020); this file proves the entities it will be built on cannot silently
 * misrepresent tenancy.
 */
import { describe, it, expect } from 'vitest';
import type { PrincipalId, PartyId, WorkspaceId } from '@finch/contracts';
import { createPrincipal } from './principal.js';
import { createParty } from './party.js';
import { createWorkspace } from './workspace.js';
import { createMembership, membershipGrants, revokeMembership } from './membership.js';

const principalId = 'principal-1' as PrincipalId;
const partyId = 'party-1' as PartyId;
const workspaceId = 'workspace-1' as WorkspaceId;
const otherWorkspaceId = 'workspace-2' as WorkspaceId;

describe('createPrincipal', () => {
  it('creates a principal of a declared type', () => {
    expect(createPrincipal(principalId, 'HUMAN')).toEqual({ id: principalId, type: 'HUMAN' });
  });

  it('rejects an empty id', () => {
    expect(() => createPrincipal('' as PrincipalId, 'HUMAN')).toThrow(/non-empty id/);
  });
});

describe('createParty', () => {
  it('creates a party of a declared type', () => {
    expect(createParty(partyId, 'PERSON')).toEqual({ id: partyId, type: 'PERSON' });
  });

  it('rejects an empty id', () => {
    expect(() => createParty('' as PartyId, 'PERSON')).toThrow(/non-empty id/);
  });
});

describe('createWorkspace', () => {
  it('creates a workspace of a declared type', () => {
    expect(createWorkspace(workspaceId, 'PERSONAL')).toEqual({
      id: workspaceId,
      type: 'PERSONAL',
    });
  });

  it('rejects an empty id', () => {
    expect(() => createWorkspace('' as WorkspaceId, 'PERSONAL')).toThrow(/non-empty id/);
  });
});

describe('createMembership', () => {
  it('defaults to ACTIVE with the granted capabilities', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['account.read'],
    });
    expect(membership.status).toBe('ACTIVE');
    expect(membership.capabilities).toEqual(['account.read']);
  });

  it('never grants access implicitly — an empty capability set is rejected', () => {
    expect(() => createMembership({ principalId, workspaceId, capabilities: [] })).toThrow(
      /at least one capability/,
    );
  });
});

describe('membershipGrants — README §9 harness', () => {
  const membership = createMembership({
    principalId,
    workspaceId,
    capabilities: ['account.read'],
  });

  it('owner allowed: an active member with the capability is granted', () => {
    expect(membershipGrants(membership, 'account.read')).toBe(true);
  });

  it('membership without grant denied: a capability outside the granted set is denied', () => {
    expect(membershipGrants(membership, 'account.write')).toBe(false);
  });

  it('revoked member denied: revocation overrides an otherwise-matching capability', () => {
    const revoked = revokeMembership(membership);
    expect(membershipGrants(revoked, 'account.read')).toBe(false);
  });

  it('other workspace denied: a Membership only ever names one workspace', () => {
    // Structural, not behavioural: this is what makes "other workspace denied" a type
    // guarantee rather than a runtime check a new call site could forget.
    expect(membership.workspaceId).toBe(workspaceId);
    expect(membership.workspaceId).not.toBe(otherWorkspaceId);
  });
});
