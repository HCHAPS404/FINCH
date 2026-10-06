/**
 * NOT real authentication. There is no backend, no session, no user table —
 * FIN-021 (Auth provider port) and the apps/api endpoint it needs don't exist yet
 * (see apps/web/README.md "Does not own"). This is a single hardcoded credential pair
 * checked entirely in the browser, so a reviewer isn't stuck at the login screen
 * before that real work exists. Delete this file once FIN-021 lands.
 */
export const DEMO_EMAIL = 'laura@correo.com';
export const DEMO_PASSWORD = 'finch2026';

export function isDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}
