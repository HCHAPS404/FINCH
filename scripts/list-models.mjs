/* global fetch -- Node 24 built-in; the repo-scripts ESLint globals predate its use. */
/**
 * S0-05 helper: list the model IDs Token Factory actually serves, so ADR-0036 and
 * `.env` record verified IDs instead of IDs written from memory (.ai/rules/00-core.md).
 *
 * Usage (reads the key from the gitignored .env; the key is never printed):
 *   pnpm ai:models
 *   pnpm ai:models nemotron      # optional case-insensitive filter
 */
const baseUrl = process.env.NEBIUS_BASE_URL || 'https://api.tokenfactory.nebius.com/v1/';
const key = process.env.NEBIUS_API_KEY;
if (!key) {
  console.error('NEBIUS_API_KEY is not set. Add it to .env (gitignored), never to a tracked file.');
  process.exit(1);
}

const filter = (process.argv[2] ?? '').toLowerCase();
const url = new URL('models', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
if (!response.ok) {
  // Status only: provider error bodies are never echoed (README §119).
  console.error(`GET ${url.pathname} failed with HTTP ${response.status}.`);
  process.exit(1);
}
const body = await response.json();
const ids = (Array.isArray(body?.data) ? body.data : [])
  .map((model) => String(model?.id ?? ''))
  .filter((id) => id !== '' && id.toLowerCase().includes(filter))
  .sort();
console.log(`${ids.length} model(s) at ${url.origin} (${new Date().toISOString()}):`);
for (const id of ids) console.log(`  ${id}`);
