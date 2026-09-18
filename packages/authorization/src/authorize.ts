/**
 * Relational authorization — README §9.
 *
 * `authorize` is a pure function: everything it needs arrives in its input, never
 * fetched from storage or ambient state ("A decision never depends on ambient state;
 * everything arrives in the request"). The composition root looks up the caller's
 * Membership via @finch/db and passes it in — this package never touches a database
 * driver or a vendor SDK (`no-direct-db-outside-adapters`,
 * `provider-sdks-only-in-adapters`).
 *
 * Deny by default: any path this function does not explicitly allow returns denied,
 * including principal types (ADMIN, SERVICE) a naive implementation might special-case
 * into an implicit bypass. "Admin scoped" and "service principal least privilege" in
 * the README §9 harness mean exactly that — an ADMIN or SERVICE Principal is
 * authorized by its Membership's capabilities like any other, never by its type, so
 * this function does not even look at `Principal.type`.
 *
 * Two things README §9's harness names are deliberately not covered here yet:
 * per-resource Grant (§8.5, a narrower permission than a workspace-wide capability)
 * arrives when a resource actually needs it; "support masked-only" access is a
 * response-shaping concern — `AuthorizationDecision` only ever answers allowed/denied
 * with a reason, and redacting a response is whichever package renders it, not this
 * one's job.
 */
import type { AuthorizationRequest, AuthorizationDecision } from '@finch/contracts';
import { membershipGrants, type Membership } from '@finch/domain';

export interface AuthorizeInput {
  readonly request: AuthorizationRequest;
  /** The caller's Membership in `request.workspaceId`, looked up by the caller. */
  readonly membership: Membership | undefined;
}

function deny(denialCode: string, reason: string): AuthorizationDecision {
  return { allowed: false, denialCode, reason };
}

function allow(reason: string): AuthorizationDecision {
  return { allowed: true, reason };
}

export function authorize({ request, membership }: AuthorizeInput): AuthorizationDecision {
  if (membership === undefined) {
    return deny(
      'NO_MEMBERSHIP',
      `Principal ${request.principalId} has no membership in workspace ${request.workspaceId}`,
    );
  }

  // A Membership for a different workspace than the request is a caller bug, not a
  // policy question — it still must deny rather than silently fall through.
  if (membership.workspaceId !== request.workspaceId) {
    return deny(
      'WORKSPACE_MISMATCH',
      `Membership belongs to workspace ${membership.workspaceId}, not ${request.workspaceId}`,
    );
  }

  if (!membershipGrants(membership, request.action)) {
    return deny(
      'CAPABILITY_NOT_GRANTED',
      membership.status === 'REVOKED'
        ? `Membership for principal ${request.principalId} has been revoked`
        : `Membership does not grant capability "${request.action}"`,
    );
  }

  return allow(`Membership grants capability "${request.action}"`);
}
