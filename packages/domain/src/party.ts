/**
 * Party — README §8.2.
 *
 * The economic or legal entity represented — a person or an organization. A resource
 * carries a `partyId` only when economic ownership is actually relevant (README §8.6);
 * plenty of tenant-owned resources never need one.
 */
import type { PartyId, PartyType } from '@finch/contracts';

export interface Party {
  readonly id: PartyId;
  readonly type: PartyType;
}

export function createParty(id: PartyId, type: PartyType): Party {
  if (id.length === 0) {
    throw new Error('Party requires a non-empty id');
  }
  return { id, type };
}
