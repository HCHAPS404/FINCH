/**
 * Workspace — README §8.3.
 *
 * The primary isolation and collaboration boundary. Every tenant-owned resource
 * carries a `workspaceId` (README §8.6, `TenantOwned` in @finch/contracts); a Workspace
 * is never deduced from an email address or any other external identifier.
 */
import type { WorkspaceId, WorkspaceType } from '@finch/contracts';

export interface Workspace {
  readonly id: WorkspaceId;
  readonly type: WorkspaceType;
}

export function createWorkspace(id: WorkspaceId, type: WorkspaceType): Workspace {
  if (id.length === 0) {
    throw new Error('Workspace requires a non-empty id');
  }
  return { id, type };
}
