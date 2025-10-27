import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Turbopack config - specify root to avoid workspace detection issues
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude xterm packages from server-side bundling
      config.externals = config.externals || [];
      config.externals.push({
        '@xterm/xterm': 'commonjs @xterm/xterm',
        '@xterm/addon-fit': 'commonjs @xterm/addon-fit',
      });
    }
    return config;
  },
};

export default nextConfig;
