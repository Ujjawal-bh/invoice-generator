# Deploying InvoiceKit on Railway

## Prerequisites

- Railway account and project linked to this repository
- PostgreSQL plugin (or external Postgres) attached to the web service

## Environment variables

Set these on the Railway **web** service:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string from Railway Postgres (include `?schema=public` if needed) |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public URL of the deployed app (e.g. `https://your-service.up.railway.app`) |

Railway injects `PORT`; Next.js respects it automatically via `next start`.

## Build & release commands

Default NPM scripts:

- **Build:** `npm run build` (runs `prisma generate` then `next build`)
- **Start:** `npm run start`
- **Migrations:** run once per deploy, e.g. `npx prisma migrate deploy`

Recommended: add a Railway **deploy hook** or one-off command step:

```bash
npx prisma migrate deploy
```

Ensure `DATABASE_URL` is available in that step.

## Local development

1. Copy `.env.example` → `.env` and fill values.
2. Create database and run migrations:

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Notes

- PDF generation uses PDFKit on the Node.js runtime (`nodejs` route segment).
- Auth routes live under `/api/auth/*` via Auth.js.
