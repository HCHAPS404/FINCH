// Writes dist/finch-tokens.css from the compiled tokens (run after `tsc -b`).
import { writeFileSync } from 'node:fs';
import { renderCss } from './dist/index.js';

writeFileSync(new URL('./dist/finch-tokens.css', import.meta.url), renderCss());
console.log('design-tokens: wrote dist/finch-tokens.css');
