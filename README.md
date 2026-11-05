# ProPlumb Website

Astro website for ProPlumb, built for Netlify with static marketing pages, dynamic contact/career form endpoints, and WordPress-powered career listings.

## Requirements

- Node.js 20 or newer
- npm
- Netlify project configured for deployment
- SMTP credentials for contact and career application emails

## Local Setup

```sh
npm install
npm run dev
```

The local dev server usually runs at `http://localhost:4321`.

## Production Checks

```sh
npm run build
npm run preview
```

The build generates static marketing routes, a Netlify server function for SSR/API routes, and sitemap files using the production site URL `https://proplumb.com.au`.

## Environment Variables

Create a local `.env` file from `.env.example` and configure the same variables in Netlify.

Required for form email delivery:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Optional:

- `CAREERS_TO_EMAIL`, used for career applications. Falls back to `CONTACT_TO_EMAIL`.

## Content Editing

Showcase project pages live in `src/content/showcase`. Each file supports:

- `title`
- `seoTitle`
- `seoDescription`
- `ogImage`
- `status` (`draft` or `publish`; draft projects are hidden from public showcase listings and routes)
- `shortDescription`
- `image`
- `gallery`
- `client`
- `location`
- `completionDate`
- `projectType`
- `disciplines`

Career content can live in `src/content/careers`, but the public careers UI currently loads open roles from `https://careers.proplumb.com.au`.

## SEO Notes

- Page metadata is passed through `src/layouts/Layout.astro`.
- Global organization schema is emitted from `src/lib/seo.ts`.
- FAQ schema is generated on `/faqs`.
- Breadcrumb schema is generated for service, showcase, contact, and career detail routes.
- Sitemap generation is configured in `astro.config.mjs`.
- Crawling rules live in `public/robots.txt`.

## Forms and Spam Protection

Contact and career application APIs live in `src/pages/api`. They include server-side validation, a honeypot field, and in-memory rate limiting. For stronger production protection, add a managed bot challenge or durable rate limit at the Netlify/CDN layer.

## Deployment

Deploy through Netlify using:

```sh
npm run build
```

The site uses `@astrojs/netlify`, so Netlify will emit redirects and a server function automatically during the build.
