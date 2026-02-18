/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.CONVEX_URL,
    NEXT_PUBLIC_ADMIN_ID: process.env.ADMIN_ID,
  },
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      // Локальный хост, если определен
      ...(process.env.NEXT_PUBLIC_LOCAL_IMAGE_HOST
        ? [
            {
              protocol: 'http',
              hostname: process.env.NEXT_PUBLIC_LOCAL_IMAGE_HOST,
              port: process.env.NEXT_PUBLIC_LOCAL_IMAGE_PORT || '3000',
              pathname: '/public/**',
            },
          ]
        : [
            {
              protocol: 'http',
              hostname: 'storage.yandexcloud.net',
              port: '3000',
              pathname: '/public/**',
            },
          ]),
      // Продакшн хост, если определен
      ...(process.env.NEXT_PUBLIC_PROD_IMAGE_HOST
        ? [
            {
              protocol: 'https',
              hostname: process.env.NEXT_PUBLIC_PROD_IMAGE_HOST,
              pathname: '/public/**',
            },
          ]
        : [
            {
              protocol: 'https',
              hostname: 'api.drsarha.ru',
              pathname: '/public/**',
            },
            {
              protocol: 'https',
              hostname: 'https://storage.yandexcloud.net',
              pathname: '/public/**',
            },{
              protocol: 'https',
              hostname: 'https://storage.yandexcloud.net',
              pathname: '/public/**',
            },
          ]),
          {
            protocol: 'https',
            hostname: 'storage.yandexcloud.net',
          },
      {
        protocol: 'https',
        hostname: 'api.drsarha.dev.reflectai.pro',
        pathname: '/public/**',
      },
    ],
    unoptimized: process.env.UNOPTIMIZED_IMAGES === '1',
    deviceSizes: [767, 980, 1156, 1400, 1920],
    formats: ['image/webp'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const API_URL =
      process.env.NEXT_PUBLIC_FRONT_API_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/knowledge',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
