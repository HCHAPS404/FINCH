/** Joins conditional class names, dropping falsy entries. */
export function cx(...parts: readonly (string | false | undefined | null)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(' ');
}

/**
 * Looks up a CSS module class by name with a clear failure instead of a silent
 * `undefined` in the DOM — `noPropertyAccessFromIndexSignature` (tsconfig.base.json)
 * requires bracket access on CSS module imports; this centralizes it once instead of
 * scattering `styles['x']!` through every component.
 */
export function cls(mod: Readonly<Record<string, string>>, key: string): string {
  const value = mod[key];
  if (!value) throw new Error(`Missing CSS module class "${key}"`);
  return value;
}
