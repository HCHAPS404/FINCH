/**
 * Principal — README §8.1.
 *
 * The entity that authenticates or acts. Deliberately distinct from Party (§8.2): a
 * service account moving data on a household's behalf is a Principal, never an
 * economic owner, and collapsing the two back into a single `user_id` is exactly the
 * anti-pattern README §100 warns against.
 */
import type { PrincipalId, PrincipalType } from '@finch/contracts';

export interface Principal {
  readonly id: PrincipalId;
  readonly type: PrincipalType;
}

export function createPrincipal(id: PrincipalId, type: PrincipalType): Principal {
  if (id.length === 0) {
    throw new Error('Principal requires a non-empty id');
  }
  return { id, type };
}
