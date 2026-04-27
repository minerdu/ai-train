/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/train',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/train',
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
