import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig.json sets "jsx": "preserve" (Next.js transforms JSX itself at build
  // time) — vitest has no such build step, so Vite 8's oxc transformer needs to do it
  // here instead. (Not `esbuild`: Vite 8 replaced esbuild with oxc as the default
  // transformer, and warns the esbuild option is ignored when both are set.)
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
  },
});
