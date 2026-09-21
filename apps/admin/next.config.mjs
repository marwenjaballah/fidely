/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', '@repo/auth', '@repo/types'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
