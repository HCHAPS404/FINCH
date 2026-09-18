/**
 * `authorize` tests — the README §9 harness, run against this package directly.
 */
import { describe, it, expect } from 'vitest';
import type { AuthorizationRequest, PrincipalId, WorkspaceId } from '@finch/contracts';
import { createMembership, revokeMembership } from '@finch/domain';
import { authorize } from './authorize.js';

const principalId = 'principal-1' as PrincipalId;
const workspaceId = 'workspace-1' as WorkspaceId;
const otherWorkspaceId = 'workspace-2' as WorkspaceId;

function requestFor(action: string, workspace: WorkspaceId = workspaceId): AuthorizationRequest {
  return {
    principalId,
    action,
    resourceType: 'account',
    resourceId: null,
    workspaceId: workspace,
    context: {},
  };
}

describe('authorize — README §9 harness', () => {
  it('owner allowed: an active membership with the capability is granted', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['account.read'],
    });
    expect(authorize({ request: requestFor('account.read'), membership }).allowed).toBe(true);
  });

  it('other workspace denied: no membership in that workspace means no access', () => {
    const decision = authorize({
      request: requestFor('account.read', otherWorkspaceId),
      membership: undefined,
    });
    expect(decision.allowed).toBe(false);
  });

  it('other workspace denied: a membership scoped to a different workspace is rejected outright', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['account.read'],
    });
    const decision = authorize({
      request: requestFor('account.read', otherWorkspaceId),
      membership,
    });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.denialCode).toBe('WORKSPACE_MISMATCH');
  });

  it('membership without grant denied: a capability outside the granted set is denied', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['account.read'],
    });
    const decision = authorize({ request: requestFor('account.write'), membership });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.denialCode).toBe('CAPABILITY_NOT_GRANTED');
  });

  it('revoked member denied: revocation overrides a previously-granted capability', () => {
    const membership = revokeMembership(
      createMembership({ principalId, workspaceId, capabilities: ['account.read'] }),
    );
    expect(authorize({ request: requestFor('account.read'), membership }).allowed).toBe(false);
  });

  it('admin scoped: an ADMIN-shaped capability set grants nothing beyond what it lists', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['support.read'],
    });
    expect(authorize({ request: requestFor('workspace.admin'), membership }).allowed).toBe(false);
  });

  it('service principal least privilege: a narrow capability grants exactly that action and nothing else', () => {
    const membership = createMembership({
      principalId,
      workspaceId,
      capabilities: ['provider.sync'],
    });
    expect(authorize({ request: requestFor('provider.sync'), membership }).allowed).toBe(true);
    expect(authorize({ request: requestFor('payment.execute'), membership }).allowed).toBe(false);
  });

  it('every denial carries a debuggable reason, never a bare boolean', () => {
    const decision = authorize({ request: requestFor('account.read'), membership: undefined });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.reason.length).toBeGreaterThan(0);
      expect(decision.denialCode).toBe('NO_MEMBERSHIP');
    }
  });
});
