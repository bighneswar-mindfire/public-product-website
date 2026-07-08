# Courav Frontend (Next.js)

The frontend for Vertex SaaS is a high-performance web application built with **Next.js 16 (App Router)** and **Tailwind CSS v4**. It features a hybrid rendering architecture to maximize speed and SEO.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **Styling:** Tailwind CSS v4
- **Authentication:** Firebase Auth + Signed JWT (via `jose`)
- **Observability:** Sentry (APM & Error Tracking)
- **Rate Limiting:** Upstash Redis (Edge Middleware)
- **Testing:** Vitest

## Features & Rendering Strategies

Each section of the application displays its rendering type in the bottom-right corner:

- **Landing Page (`/`)**: **ISR** (Incremental Static Regeneration) - Hourly revalidation.
- **Features (`/features`)**: **ISR** - Sourced from Strapi CMS.
- **Pricing (`/pricing`)**: **SSG** - Static generation for optimal performance.
- **Blog (`/blog`)**: **ISR** - Dynamic paths generated via `generateStaticParams`.
- **Dashboard (`/dashboard`)**: **SSR** - Secured via server-side JWT verification.
- **Waitlist & Stats**: **CSR** - Interactive components polling system APIs.

## Authentication Flow

1. User logs in via Firebase Client SDK.
2. Token data is sent to `/api/auth/session`.
3. The server signs a **JWT** using a secret key .
4. The Dashboard Server Component verifies this signature before rendering, preventing cookie tampering.

## Testing

We use Vitest for both Unit and Integration testing.

```bash
# Run all tests
npm run test
```

## Local Development

1. Ensure .env.local is configured with Firebase and Sentry keys.
2. Run `npm install`.
3. Run `npm run dev`.
