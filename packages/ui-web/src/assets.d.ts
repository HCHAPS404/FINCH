declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/**
 * A bare `*.svg` import resolves to a plain string URL in Vite (apps/desktop) by
 * default. Next.js/Turbopack (apps/web) defaults to a next/image-style
 * `{ src, width, height }` object instead — apps/web's next.config.ts sets
 * `turbopack.rules['*.svg'] = { type: 'asset' }` to force the same plain-string result
 * there too, so this package's own source can stay bundler-agnostic.
 */
declare module '*.svg' {
  const url: string;
  export default url;
}
