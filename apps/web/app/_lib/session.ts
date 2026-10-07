/**
 * Client-side session storage — ADR-0041.
 *
 * `apps/api` has no `@fastify/cookie` support wired in, so an httpOnly cookie isn't
 * available yet; this is a documented-as-temporary `localStorage` token instead. It
 * is not a security boundary (no XSS mitigation beyond React's own), only enough to
 * prove signup → login → authenticated request → authorized action works end to end
 * (README §116 applies once this moves to a real cookie-based session).
 */
const STORAGE_KEY = 'finch.session';

export interface Session {
  readonly token: string;
  readonly principalId: string;
  readonly workspaceId: string;
}

export function getSession(): Session | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return undefined;
  }
}

export function setSession(session: Session): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
