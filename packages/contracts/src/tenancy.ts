/**
 * Identity, tenancy and ownership — README §3.1, §8.
 *
 * The single most important structural decision in FINCH: `User` is not one thing.
 * Collapsing authentication, economic ownership and tenancy into a `user_id` is what
 * makes a personal-finance app impossible to extend to households and businesses
 * without a rewrite (README §100, anti-pattern list).
 *
 *   Principal  — who authenticates or acts
 *   Party      — who is economically represented
 *   Workspace  — the isolation and collaboration boundary
 *   Membership — what a Principal may do inside a Workspace
 *   Grant      — a narrower permission over a specific resource
 */

export const PRINCIPAL_TYPES = ['HUMAN', 'SERVICE', 'SYSTEM', 'ADMIN'] as const;
export type PrincipalType = (typeof PRINCIPAL_TYPES)[number];

export const PARTY_TYPES = ['PERSON', 'ORGANIZATION'] as const;
export type PartyType = (typeof PARTY_TYPES)[number];

export const WORKSPACE_TYPES = ['PERSONAL', 'HOUSEHOLD', 'BUSINESS'] as const;
export type WorkspaceType = (typeof WORKSPACE_TYPES)[number];

export type PrincipalId = string & { readonly __brand: 'PrincipalId' };
export type PartyId = string & { readonly __brand: 'PartyId' };
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' };

/**
 * Every tenant-owned resource carries this. README §8.6:
 *   - `workspaceId` is the isolation boundary and is mandatory
 *   - `partyId` appears when economic ownership matters
 *   - `createdByPrincipalId` identifies the ACTOR, never the owner
 */
export interface TenantOwned {
  readonly workspaceId: WorkspaceId;
  readonly partyId?: PartyId;
  readonly createdByPrincipalId: PrincipalId;
}

/**
 * The authorization question, as a type — README §9.
 *
 * Deliberately not RBAC: households, shared accounts, delegation and support access
 * are relational, not role-scalar (README §3.2). Context carries device, session,
 * risk and purpose so step-up and purpose-limitation are expressible.
 */
export interface AuthorizationRequest {
  readonly principalId: PrincipalId;
  /** A typed capability such as `account.read`, never a free-form string in callers. */
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly workspaceId: WorkspaceId;
  readonly context: {
    readonly sessionId?: string;
    readonly deviceId?: string;
    readonly riskScore?: number;
    readonly purpose?: string;
    readonly stepUpVerifiedAt?: Date;
  };
}

/**
 * Authorization answers carry a reason. A bare boolean makes denials undebuggable
 * and makes the negative-path tests in README §9 impossible to assert precisely.
 */
export type AuthorizationDecision =
  | { readonly allowed: true; readonly reason: string }
  | { readonly allowed: false; readonly reason: string; readonly denialCode: string };
