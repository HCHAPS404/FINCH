/**
 * Membership — README §8.4, §9.
 *
 * Relates a Principal to a Workspace together with the typed capabilities it grants.
 * README §9's authorization model is relational, not role-scalar, so a Membership
 * carries an explicit capability set rather than a role name — a household member can
 * see a shared goal without seeing a partner's personal card. Grant (§8.5), a narrower
 * per-resource permission, refines this further and is not in Foundation scope.
 *
 * `membershipGrants` is where the "revoked member denied" case from the §9 harness
 * lives: a revoked Membership is inert regardless of the capabilities it still lists,
 * so revocation is a status check, never "remove entries from an array and hope every
 * caller re-reads it."
 */
import type { PrincipalId, WorkspaceId } from '@finch/contracts';

export const MEMBERSHIP_STATUSES = ['ACTIVE', 'REVOKED'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface Membership {
  readonly principalId: PrincipalId;
  readonly workspaceId: WorkspaceId;
  readonly capabilities: readonly string[];
  readonly status: MembershipStatus;
}

export function createMembership(input: {
  readonly principalId: PrincipalId;
  readonly workspaceId: WorkspaceId;
  readonly capabilities: readonly string[];
  readonly status?: MembershipStatus;
}): Membership {
  if (input.capabilities.length === 0) {
    throw new Error(
      'Membership requires at least one capability — access is granted explicitly, never implicitly',
    );
  }
  return {
    principalId: input.principalId,
    workspaceId: input.workspaceId,
    capabilities: input.capabilities,
    status: input.status ?? 'ACTIVE',
  };
}

/** A revoked Membership grants nothing, regardless of its capability list. */
export function membershipGrants(membership: Membership, capability: string): boolean {
  return membership.status === 'ACTIVE' && membership.capabilities.includes(capability);
}

export function revokeMembership(membership: Membership): Membership {
  return { ...membership, status: 'REVOKED' };
}
