import { MetadataRoute } from 'next';

const VERCEL_ENV = process.env.VERCEL_ENV;

const vercelRules = {
  userAgent: '*',
  disallow: '/',
};

const productionRules = {
  userAgent: '*',
  allow: '/',
  disallow: '/api/',
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: VERCEL_ENV ? vercelRules : productionRules,
    // sitemap: 'https://acme.com/sitemap.xml',
  };
}
