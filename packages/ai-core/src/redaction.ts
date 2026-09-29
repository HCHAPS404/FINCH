/**
 * Deterministic PII redaction before egress — README §31, AGENTS.md §4.
 *
 * Text leaves FINCH for a model provider only after this runs. Each match is replaced
 * by a typed placeholder (`<EMAIL_1>`, `<NUMBER_1>`); the placeholder → value map
 * stays on the server so the answer can be restored for the same user.
 *
 * Scope of this first version (walking skeleton, S0-07), stated honestly:
 *
 * - emails;
 * - runs of 10 or more digits, optionally grouped by spaces or dashes — card numbers
 *   (13–19), Colombian mobile numbers (10) and most account numbers.
 *
 * National ID numbers shorter than 10 digits and personal names are NOT caught yet:
 * telling "12345678" (an ID) from "12345678" (an amount in pesos) needs context, and
 * guessing would either leak IDs or destroy the amounts the user is asking about.
 * Context-aware detection arrives with the full AI Gateway (task S1-04).
 */

export interface RedactionResult {
  /** Text safe to send to the provider. */
  readonly text: string;
  /** Placeholder → original value. Server-side only; never logged, never sent. */
  readonly replacements: ReadonlyMap<string, string>;
}

interface Detector {
  readonly kind: string;
  readonly pattern: RegExp;
}

// Order matters: emails first, so the digits inside an address are not
// double-counted as a number.
const DETECTORS: readonly Detector[] = [
  { kind: 'EMAIL', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  // A long digit run that is not part of a decimal amount: no digit, and no
  // "digit + separator" (4.200.000 / 1.234,56), on either side. Trailing punctuation
  // such as "…3001234567, and" still counts as a boundary.
  { kind: 'NUMBER', pattern: /(?<!\d|\d[.,])\d(?:[ -]?\d){9,}(?!\d|[.,]\d)/g },
];

export function redactPii(input: string): RedactionResult {
  const replacements = new Map<string, string>();
  let text = input;
  for (const { kind, pattern } of DETECTORS) {
    let counter = 0;
    text = text.replace(pattern, (match) => {
      counter += 1;
      const placeholder = `<${kind}_${String(counter)}>`;
      replacements.set(placeholder, match);
      return placeholder;
    });
  }
  return { text, replacements };
}

/** Put the user's own values back into text shown to that same user. */
export function restorePii(text: string, replacements: ReadonlyMap<string, string>): string {
  let restored = text;
  for (const [placeholder, value] of replacements) {
    restored = restored.split(placeholder).join(value);
  }
  return restored;
}
