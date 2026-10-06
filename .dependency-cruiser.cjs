/**
 * FINCH architecture fitness functions.
 *
 * Normative source: docs/architecture/CONSTITUTION.md (README §N) §8 (Architecture boundaries), §14 (Financial Engine),
 * §20 (Bounded Contexts), §27 (Provider Architecture), §64 (Architecture Fitness Functions).
 *
 * These rules are executable architecture. A violation is a build failure, not a warning
 * to be triaged later. Changing a rule requires an ADR (README §76).
 */

/** SDKs and frameworks that may only ever appear in infrastructure adapters. */
const INFRASTRUCTURE_MODULES = [
  '^@nestjs/',
  '^fastify',
  '^react$',
  '^react-dom',
  '^react-native',
  '^next',
  '^expo',
  '^@tauri-apps/',
  '^drizzle-orm',
  '^drizzle-kit',
  '^pg$',
  '^postgres$',
  '^@aws-sdk/',
  '^aws-sdk',
  '^@sentry/',
  '^@opentelemetry/',
  '^auth0',
  '^@auth0/',
  '^@anthropic-ai/',
  '^openai',
  '^posthog',
  '^ioredis',
  '^redis$',
];

module.exports = {
  forbidden: [
    // ---------------------------------------------------------------------
    // Constitution §2, §14 — the financial engine is a pure library.
    // ---------------------------------------------------------------------
    {
      name: 'financial-engine-is-pure',
      comment:
        'README §14: packages/financial-engine must be a pure library. It may not import ' +
        'NestJS, React, AWS SDK, Drizzle or LLM SDKs. Financial truth must be computable ' +
        'with no infrastructure present.',
      severity: 'error',
      from: { path: '^packages/financial-engine/' },
      to: { path: INFRASTRUCTURE_MODULES.join('|') },
    },
    {
      name: 'financial-engine-depends-on-contracts-only',
      comment:
        'README §14: the financial engine may only depend on @finch/contracts among ' +
        'workspace packages. Anything else couples financial math to the platform.',
      severity: 'error',
      from: { path: '^packages/financial-engine/' },
      to: {
        path: '^packages/',
        pathNot: '^packages/(financial-engine|contracts)/',
      },
    },

    // ---------------------------------------------------------------------
    // Constitution §8 — domain does not depend on infrastructure.
    // ---------------------------------------------------------------------
    {
      name: 'domain-is-framework-free',
      comment:
        'README §8: the domain layer may not depend on NestJS, React, AWS SDK, Drizzle, ' +
        'Auth0, Anthropic, OpenAI, Sentry or any provider-specific SDK. Adapters may.',
      severity: 'error',
      from: { path: '^packages/domain/' },
      to: { path: INFRASTRUCTURE_MODULES.join('|') },
    },
    {
      name: 'domain-does-not-import-adapters',
      comment:
        'README §8: dependency direction is domain → application → ports → adapters. ' +
        'The domain must never reach into db, api-client, ai-core, observability or provider-sdk.',
      severity: 'error',
      from: { path: '^packages/domain/' },
      to: {
        path: '^packages/(db|api-client|ai-core|observability|provider-sdk|ui-web|ui-mobile)/',
      },
    },

    // ---------------------------------------------------------------------
    // §9 / §31 — contracts are the shared vocabulary and must stay dependency-light.
    // ---------------------------------------------------------------------
    {
      name: 'contracts-are-leaf',
      comment:
        'packages/contracts is the shared vocabulary (schemas, error taxonomy, event ' +
        'envelope, truth classes). It must not depend on any other workspace package.',
      severity: 'error',
      from: { path: '^packages/contracts/' },
      to: { path: '^packages/', pathNot: '^packages/contracts/' },
    },

    // ---------------------------------------------------------------------
    // §27 — provider SDKs live only behind adapters.
    // ---------------------------------------------------------------------
    {
      name: 'provider-sdks-only-in-adapters',
      comment:
        'README §27: the domain never imports a vendor SDK directly. Provider SDKs are ' +
        'confined to apps/*/src/infrastructure/** and packages/provider-sdk adapters.',
      severity: 'error',
      from: {
        path: '^packages/(domain|financial-engine|contracts|authorization)/',
      },
      to: { path: '^(@aws-sdk/|auth0|@auth0/|@anthropic-ai/|openai|posthog)' },
    },

    // ---------------------------------------------------------------------
    // §20 — no direct cross-context database access.
    // ---------------------------------------------------------------------
    {
      name: 'no-direct-db-outside-adapters',
      comment:
        'README §20/§24: only packages/db and infrastructure adapters may touch the ' +
        'database driver. Cross-module direct DB reads are forbidden without a documented ' +
        'read model.',
      severity: 'error',
      from: {
        path: '^packages/',
        pathNot: '^packages/(db|testing)/',
      },
      to: { path: '^(drizzle-orm|drizzle-kit|pg|postgres)$' },
    },

    // ---------------------------------------------------------------------
    // §55 — applications are siblings, never dependencies of one another.
    // ---------------------------------------------------------------------
    {
      name: 'apps-do-not-import-apps',
      comment:
        'README §33.2/§52: apps/web and apps/admin are separate surfaces. Applications ' +
        'share code through packages/*, never by importing each other.',
      severity: 'error',
      from: { path: '^apps/([^/]+)/' },
      to: {
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/',
      },
    },

    // ---------------------------------------------------------------------
    // §58 / §102.6 — the typed API client is generated, never hand-written.
    // ---------------------------------------------------------------------
    {
      name: 'generated-client-is-not-edited-by-hand',
      comment:
        'README §58: packages/api-client/src/generated is produced by openapi:generate. ' +
        'It must not import application code; regenerate instead of editing.',
      severity: 'error',
      from: { path: '^packages/api-client/src/generated/' },
      to: { path: '^(apps|packages)/', pathNot: '^packages/api-client/' },
    },

    // ---------------------------------------------------------------------
    // Structural hygiene
    // ---------------------------------------------------------------------
    {
      name: 'no-circular',
      comment:
        'Cycles make ownership, testing and future service extraction (README §87) ' +
        'impossible to reason about.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-deep-package-imports',
      comment:
        'A workspace package is consumed through its public entry point. Reaching into ' +
        "another package's internals bypasses the module contract declared in its README " +
        '(§98) and silently couples you to a file that was never part of the promise. ' +
        'Imports WITHIN a package are unaffected — $1 back-references the importing ' +
        'package so a package can always use its own modules.',
      severity: 'error',
      from: { path: '^packages/([^/]+)/' },
      to: {
        path: '^packages/[^/]+/src/(?!index\\.)',
        pathNot: '^packages/$1/',
      },
    },
    {
      name: 'apps-use-package-entry-points',
      comment:
        'Applications consume workspace packages through their public entry point, never ' +
        'by reaching into src/ internals (§98).',
      severity: 'error',
      from: { path: '^apps/' },
      to: { path: '^packages/[^/]+/src/(?!index\\.)' },
    },
    {
      name: 'no-dev-dependency-in-src',
      comment: 'Production source must not depend on devDependencies.',
      severity: 'error',
      from: { path: '^(apps|packages)/[^/]+/src/', pathNot: '\\.(test|spec)\\.tsx?$' },
      to: { dependencyTypes: ['npm-dev'] },
    },
    {
      name: 'no-non-package-json',
      comment: 'Every npm import must be declared in the owning package.json.',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['unknown', 'undetermined', 'npm-no-pkg', 'npm-unknown'] },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      // next-env.d.ts: auto-generated by `next dev`/`next build`, never hand-edited
      // (its own header says so). Its triple-slash reference to
      // `next/image-types/global` is a type-only reference into a subpath of the
      // already-declared `next` dependency, but dependency-cruiser resolves it against
      // the root tsconfig.base.json (not apps/web's own tsconfig), so it misreports as
      // an undeclared import. Nothing to fix in the file itself — it's not ours.
      path: '(^|/)(node_modules|dist|build|coverage|\\.next|\\.turbo|\\.expo|target|next-env\\.d\\.ts)(/|$)',
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.tsx', '.json'],
    },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)' },
      archi: {
        collapsePattern: '^(apps|packages|jurisdictions)/[^/]+|^node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
    },
  },
};
