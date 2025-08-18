import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

// Lokale endepunkter (juster for ditt oppsett)
const API_ORIGINS = ['http://localhost:8080'];
const IDP_ORIGINS = ['http://localhost:8081'];

const cspDev = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';", // dev: tillat eval for HMR
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: blob:;",
    "font-src 'self';",
    `connect-src 'self' ${API_ORIGINS.join(' ')} ${IDP_ORIGINS.join(' ')} ws: wss:;`,
    "base-uri 'self';",
    `form-action 'self' ${IDP_ORIGINS.join(' ')};`,
    "frame-ancestors 'none';",
    "object-src 'none';"
].join(' ');

const cspProd = [
    "default-src 'self';",
    "script-src 'self';", // prod: strammere
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: blob:;",
    "font-src 'self';",
    "connect-src 'self';",
    "base-uri 'self';",
    "form-action 'self';",
    "frame-ancestors 'none';",
    "object-src 'none';",
    "upgrade-insecure-requests;"
].join(' ');

const securityHeaders = [
    { key: 'Content-Security-Policy', value: isProd ? cspProd : cspDev },
    { key: 'Referrer-Policy', value: 'no-referrer' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    {
        key: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=(), payment=()'
    }
];

if (isProd) {
    securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    });
}

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders
            }
        ];
    }
};

export default nextConfig;
