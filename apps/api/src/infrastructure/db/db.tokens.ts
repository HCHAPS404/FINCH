/** DI token for the `Database` (Drizzle) handle. `Database` is a type, not a class — Nest cannot reflect it, so every consumer injects by this token. */
export const DATABASE = Symbol('DATABASE');
