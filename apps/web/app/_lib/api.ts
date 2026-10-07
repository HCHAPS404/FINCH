/**
 * Typed fetch client for `apps/api` — ADR-0041. A small hand-written wrapper, not a
 * generated OpenAPI client: this pass needs signup/login/profile/finance/documents,
 * not full API surface coverage.
 */
import type { FinchErrorBody } from '@finch/contracts';
import { getSession, type Session } from './session';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, body: FinchErrorBody) {
    super(body.error.message);
    this.name = 'ApiError';
    this.code = body.error.code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth !== false) {
    const session = getSession();
    if (session !== undefined) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as FinchErrorBody;
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// --- Auth -------------------------------------------------------------------

export function signup(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<Session> {
  return request<Session>('/auth/signup', { method: 'POST', body: input, auth: false });
}

export function login(input: { email: string; password: string }): Promise<Session> {
  return request<Session>('/auth/login', { method: 'POST', body: input, auth: false });
}

export function requestPasswordReset(email: string): Promise<{ token?: string }> {
  return request('/auth/password-reset/request', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

export function confirmPasswordReset(token: string, newPassword: string): Promise<{ ok: true }> {
  return request('/auth/password-reset/confirm', {
    method: 'POST',
    body: { token, newPassword },
    auth: false,
  });
}

// --- Profile ------------------------------------------------------------------

export interface MeProfile {
  readonly partyId: string;
  readonly principalId: string;
  readonly displayName: string;
  readonly dateOfBirth: string | null;
  readonly phone: string | null;
  readonly locale: string;
}

export function getMe(): Promise<MeProfile> {
  return request('/me');
}

export function updateMe(
  input: Partial<Pick<MeProfile, 'displayName' | 'dateOfBirth' | 'phone' | 'locale'>>,
): Promise<MeProfile> {
  return request('/me', { method: 'PATCH', body: input });
}

// --- Finance: debts -------------------------------------------------------------

export interface Debt {
  readonly id: string;
  readonly name: string;
  readonly creditor: string;
  readonly principalAmountMinor: string;
  readonly currency: string;
  readonly interestRateBps: number | null;
  readonly dueDate: string | null;
  readonly status: string;
}

export function listDebts(workspaceId: string): Promise<Debt[]> {
  return request(`/workspaces/${workspaceId}/debts`);
}

export function createDebt(
  workspaceId: string,
  input: {
    name: string;
    creditor: string;
    principalAmountMinor: string;
    currency: string;
    interestRateBps?: number;
    dueDate?: string;
  },
): Promise<Debt> {
  return request(`/workspaces/${workspaceId}/debts`, { method: 'POST', body: input });
}

export function deleteDebt(workspaceId: string, id: string): Promise<{ ok: true }> {
  return request(`/workspaces/${workspaceId}/debts/${id}`, { method: 'DELETE' });
}

// --- Finance: cards -------------------------------------------------------------

export interface Card {
  readonly id: string;
  readonly issuer: string;
  readonly network: string | null;
  readonly lastFour: string;
  readonly creditLimitMinor: string | null;
  readonly currency: string;
  readonly cutDay: number | null;
  readonly paymentDueDay: number | null;
}

export function listCards(workspaceId: string): Promise<Card[]> {
  return request(`/workspaces/${workspaceId}/cards`);
}

export function createCard(
  workspaceId: string,
  input: {
    issuer: string;
    network?: string;
    lastFour: string;
    creditLimitMinor?: string;
    currency: string;
    cutDay?: number;
    paymentDueDay?: number;
  },
): Promise<Card> {
  return request(`/workspaces/${workspaceId}/cards`, { method: 'POST', body: input });
}

export function deleteCard(workspaceId: string, id: string): Promise<{ ok: true }> {
  return request(`/workspaces/${workspaceId}/cards/${id}`, { method: 'DELETE' });
}

// --- Documents ------------------------------------------------------------------

export interface DocumentMeta {
  readonly id: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: string;
  readonly status: string;
  readonly uploadedAt: string;
}

export function listDocuments(workspaceId: string): Promise<DocumentMeta[]> {
  return request(`/workspaces/${workspaceId}/documents`);
}

export function uploadDocument(
  workspaceId: string,
  input: { originalFilename: string; mimeType: string; contentBase64: string },
): Promise<DocumentMeta> {
  return request(`/workspaces/${workspaceId}/documents`, { method: 'POST', body: input });
}

export function deleteDocument(workspaceId: string, id: string): Promise<{ ok: true }> {
  return request(`/workspaces/${workspaceId}/documents/${id}`, { method: 'DELETE' });
}
