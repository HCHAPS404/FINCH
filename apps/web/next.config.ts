import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      // @finch/ui-web's Logo imports .svg files expecting a plain URL string (Vite's
      // default behavior). Turbopack instead defaults to a next/image-style
      // { src, width, height } object — this rule makes it match Vite everywhere,
      // including the symlinked workspace package under node_modules.
      '*.svg': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
