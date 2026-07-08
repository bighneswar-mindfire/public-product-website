# Courav Backend (Strapi CMS)

This is the Headless CMS powering the Courav marketing pages and blog journal. It provides a structured REST API for content management.

## Tech Stack

- **Framework:** Strapi CMS v5
- **Language:** TypeScript
- **Database:** PostgreSQL

## 📝Content Architecture

The system is configured with the following content types:

| Content Type     | Type        | Purpose                                         |
| :--------------- | :---------- | :---------------------------------------------- |
| **Landing Page** | Single Type | Hero section, CTAs, and Use-cases.              |
| **Feature**      | Collection  | Detailed product capabilities list.             |
| **Pricing Plan** | Collection  | Tier names, pricing, and feature arrays (JSON). |
| **Blog Post**    | Collection  | Technical articles with Slug (UID) and Content. |

## 🛡Security & Access

- **Permissions**: Public access is granted to `find` and `findOne` for all marketing types.
- **Security Headers**: Managed via Strapi's internal security middleware (Helmet).
- **CORS**: Configured to allow requests from the local Next.js frontend (port 3000).

## Database Persistence

- In development, the database is stored at `backend/.tmp/data.db`.
- When running via **Docker**, this directory is **bind-mounted** to the host machine. This ensures that any data you create in the Strapi Admin panel is preserved even if the container is destroyed or rebuilt.

## 📦 Local Development

1. Run `npm install`.
2. Run `npm run develop`.
3. Access the admin panel at `http://localhost:1337/admin` to manage content.
