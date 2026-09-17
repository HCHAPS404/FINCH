/**
 * FINCH shared ESLint configuration (flat config, ESLint 10).
 *
 * Layered so that boundary enforcement is strongest where correctness matters most:
 *   base            → every file
 *   typed           → type-aware rules for TypeScript sources
 *   pureLayers      → domain / financial-engine / contracts: no framework, no I/O
 *   finchPlugin     → Constitution rules (money precision, analytics PII)
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import finch from './plugin.js';

export const ignores = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.expo/**',
    '**/coverage/**',
    '**/target/**',
    '**/*.gen.ts',
    'packages/api-client/src/generated/**',
    'packages/db/migrations/**',
  ],
};

/** Modules that must never appear in a pure layer. */
const FORBIDDEN_IN_PURE_LAYERS = [
  { group: ['@nestjs/*'], message: 'README §8/§14: pure layers must not depend on NestJS.' },
  {
    group: ['fastify', 'fastify/*'],
    message: 'README §8: pure layers must not depend on Fastify.',
  },
  {
    group: ['react', 'react-dom', 'react-native', 'next', 'next/*', 'expo', 'expo/*'],
    message: 'README §8: pure layers must not depend on UI frameworks.',
  },
  {
    group: ['drizzle-orm', 'drizzle-orm/*', 'drizzle-kit', 'pg', 'postgres'],
    message: 'README §8/§20: pure layers must not reach the database. Use a port.',
  },
  {
    group: ['@aws-sdk/*', 'aws-sdk'],
    message: 'README §8/§27: pure layers must not import cloud SDKs.',
  },
  {
    group: ['@anthropic-ai/*', 'openai'],
    message: 'README §13/§30: pure layers must not import LLM SDKs. AI runs behind the AI Gateway.',
  },
  {
    group: ['@sentry/*', '@opentelemetry/*'],
    message: 'README §8: pure layers must not import observability SDKs. Inject a port.',
  },
  {
    group: ['auth0', '@auth0/*'],
    message: 'README §27: pure layers must not import identity SDKs.',
  },
  {
    group: ['posthog', 'posthog-js', 'posthog-node'],
    message: 'README §53: pure layers must not import analytics SDKs.',
  },
];

export const base = [
  js.configs.recommended,
  {
    plugins: { finch },
    rules: {
      'finch/no-float-money': 'error',
      'finch/no-pii-analytics': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'isNaN', message: 'Use Number.isNaN — global isNaN coerces.' },
        { name: 'isFinite', message: 'Use Number.isFinite — global isFinite coerces.' },
      ],
    },
  },
];

/** Type-aware rules apply only to TypeScript covered by a tsconfig. */
const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

export const typed = [
  ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: TS_FILES })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({ ...config, files: TS_FILES })),
  {
    files: TS_FILES,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: process.cwd() },
    },
    rules: {
      // README §57: `any` is permitted only in a documented adapter, never silently.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      // Floating promises in a financial worker mean silently dropped work.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

/** Applied to packages/domain, packages/financial-engine, packages/contracts. */
export const pureLayers = {
  files: [
    'packages/domain/**/*.ts',
    'packages/financial-engine/**/*.ts',
    'packages/contracts/**/*.ts',
  ],
  rules: {
    'no-restricted-imports': ['error', { patterns: FORBIDDEN_IN_PURE_LAYERS }],
    // README §60: the domain uses an injectable Clock; ambient time is non-deterministic
    // and makes historical decisions irreproducible (Constitution §4.5).
    'no-restricted-properties': [
      'error',
      {
        object: 'Date',
        property: 'now',
        message:
          'README §60: inject a Clock. Ambient time makes financial decisions irreproducible.',
      },
      {
        object: 'Math',
        property: 'random',
        message: 'README §15: pure layers must be deterministic. Inject a seeded source instead.',
      },
    ],
    'no-restricted-globals': [
      'error',
      { name: 'fetch', message: 'README §8: pure layers perform no I/O. Use a port.' },
      { name: 'process', message: 'README §61: read configuration through @finch/config.' },
    ],
  },
};

/**
 * Plain JavaScript — repository tooling and the ESLint rules themselves.
 *
 * These files are intentionally outside any tsconfig, so type-aware rules cannot run
 * on them. Turning the checker off explicitly is honest; leaving it on would produce
 * parser errors that people learn to ignore, which is how real findings get missed.
 */
const NODE_GLOBALS = {
  console: 'readonly',
  process: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
};

export const repoScripts = [
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: NODE_GLOBALS,
    },
    rules: { ...tseslint.configs.disableTypeChecked.rules, 'no-console': 'off' },
  },
  {
    // .cjs is CommonJS: `module`, `require` and `exports` are real globals there.
    files: ['**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...NODE_GLOBALS, module: 'writable', require: 'readonly', exports: 'writable' },
    },
    rules: { ...tseslint.configs.disableTypeChecked.rules, 'no-console': 'off' },
  },
];

/** Test files relax a few rules that only make sense in production source. */
export const tests = {
  files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx', 'evals/**/*.ts'],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    'no-restricted-properties': 'off',
    'no-console': 'off',
  },
};

/** The default composed configuration consumed by the repository root. */
export default [ignores, ...base, ...typed, pureLayers, ...repoScripts, tests, prettier];
